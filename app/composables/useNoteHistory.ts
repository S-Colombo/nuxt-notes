import type { Note, TodoItem } from '~/types/note'
import { cloneNote } from '~/types/note'

const HISTORY_LIMIT = 50
const TYPING_PAUSE_MS = 600

/** Diff-only history entry — never a full note snapshot */
export type HistoryPatch =
  | { op: 'title'; before: string; after: string }
  | { op: 'todoText'; todoId: string; before: string; after: string }
  | { op: 'todoDone'; todoId: string; before: boolean; after: boolean }
  | { op: 'todoAdd'; todo: TodoItem; index: number }
  | { op: 'todoRemove'; todo: TodoItem; index: number }

function applyPatch(note: Note, patch: HistoryPatch): void {
  switch (patch.op) {
    case 'title':
      note.title = patch.after
      break
    case 'todoText': {
      const todo = note.todos.find(item => item.id === patch.todoId)
      if (todo) todo.text = patch.after
      break
    }
    case 'todoDone': {
      const todo = note.todos.find(item => item.id === patch.todoId)
      if (todo) todo.done = patch.after
      break
    }
    case 'todoAdd':
      note.todos.splice(patch.index, 0, { ...patch.todo })
      break
    case 'todoRemove':
      note.todos.splice(patch.index, 1)
      break
  }
}

function invertPatch(patch: HistoryPatch): HistoryPatch {
  switch (patch.op) {
    case 'title':
      return { op: 'title', before: patch.after, after: patch.before }
    case 'todoText':
      return {
        op: 'todoText',
        todoId: patch.todoId,
        before: patch.after,
        after: patch.before,
      }
    case 'todoDone':
      return {
        op: 'todoDone',
        todoId: patch.todoId,
        before: patch.after,
        after: patch.before,
      }
    case 'todoAdd':
      return { op: 'todoRemove', todo: { ...patch.todo }, index: patch.index }
    case 'todoRemove':
      return { op: 'todoAdd', todo: { ...patch.todo }, index: patch.index }
  }
}

function isNoop(patch: HistoryPatch): boolean {
  if (patch.op === 'title' || patch.op === 'todoText') {
    return patch.before === patch.after
  }
  if (patch.op === 'todoDone') {
    return patch.before === patch.after
  }
  return false
}

export function useNoteHistory(draft: Ref<Note>) {
  const undoStack = ref<HistoryPatch[]>([])
  const redoStack = ref<HistoryPatch[]>([])

  let titleBaseline: string | null = null
  const todoTextBaselines = new Map<string, string>()
  let typingTimer: ReturnType<typeof setTimeout> | null = null
  let pendingField: { kind: 'title' } | { kind: 'todoText'; todoId: string } | null = null

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function clearTypingTimer() {
    if (typingTimer) {
      clearTimeout(typingTimer)
      typingTimer = null
    }
  }

  function pushPatch(patch: HistoryPatch) {
    if (isNoop(patch)) return
    undoStack.value.push(patch)
    if (undoStack.value.length > HISTORY_LIMIT) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  function flushPendingTyping() {
    clearTypingTimer()
    if (!pendingField) return

    if (pendingField.kind === 'title' && titleBaseline !== null) {
      pushPatch({
        op: 'title',
        before: titleBaseline,
        after: draft.value.title,
      })
      // Next burst after a pause starts from the latest value
      titleBaseline = draft.value.title
    }

    if (pendingField.kind === 'todoText') {
      const { todoId } = pendingField
      const baseline = todoTextBaselines.get(todoId)
      const todo = draft.value.todos.find(item => item.id === todoId)
      if (baseline !== undefined && todo) {
        pushPatch({
          op: 'todoText',
          todoId,
          before: baseline,
          after: todo.text,
        })
        todoTextBaselines.set(todoId, todo.text)
      }
    }

    pendingField = null
  }

  function scheduleTypingFlush() {
    clearTypingTimer()
    typingTimer = setTimeout(() => {
      flushPendingTyping()
    }, TYPING_PAUSE_MS)
  }

  function beginTitleEdit() {
    flushPendingTyping()
    titleBaseline = draft.value.title
  }

  function onTitleChange() {
    // Baseline must be set in beginTitleEdit (focus). If missing, skip
    // rather than recording a corrupt before===after patch from post-input value.
    if (titleBaseline === null) return
    pendingField = { kind: 'title' }
    scheduleTypingFlush()
  }

  function endTitleEdit() {
    flushPendingTyping()
    titleBaseline = null
  }

  function beginTodoTextEdit(todoId: string) {
    flushPendingTyping()
    const todo = draft.value.todos.find(item => item.id === todoId)
    if (!todo) return
    todoTextBaselines.set(todoId, todo.text)
  }

  function onTodoTextChange(todoId: string) {
    if (!todoTextBaselines.has(todoId)) return
    pendingField = { kind: 'todoText', todoId }
    scheduleTypingFlush()
  }

  function endTodoTextEdit(todoId: string) {
    if (pendingField?.kind === 'todoText' && pendingField.todoId === todoId) {
      flushPendingTyping()
    } else {
      // blur of field that already flushed on pause
      const baseline = todoTextBaselines.get(todoId)
      const todo = draft.value.todos.find(item => item.id === todoId)
      if (baseline !== undefined && todo && baseline !== todo.text) {
        pushPatch({
          op: 'todoText',
          todoId,
          before: baseline,
          after: todo.text,
        })
      }
    }
    todoTextBaselines.delete(todoId)
  }

  function recordTodoDone(todoId: string, before: boolean, after: boolean) {
    flushPendingTyping()
    pushPatch({ op: 'todoDone', todoId, before, after })
  }

  function recordTodoAdd(todo: TodoItem, index: number) {
    flushPendingTyping()
    pushPatch({ op: 'todoAdd', todo: { ...todo }, index })
  }

  function recordTodoRemove(todo: TodoItem, index: number) {
    flushPendingTyping()
    pushPatch({ op: 'todoRemove', todo: { ...todo }, index })
  }

  function undo() {
    flushPendingTyping()
    const patch = undoStack.value.pop()
    if (!patch) return
    applyPatch(draft.value, invertPatch(patch))
    redoStack.value.push(patch)
    titleBaseline = null
    todoTextBaselines.clear()
  }

  function redo() {
    flushPendingTyping()
    const patch = redoStack.value.pop()
    if (!patch) return
    applyPatch(draft.value, patch)
    undoStack.value.push(patch)
    if (undoStack.value.length > HISTORY_LIMIT) {
      undoStack.value.shift()
    }
    titleBaseline = null
    todoTextBaselines.clear()
  }

  function reset() {
    clearTypingTimer()
    pendingField = null
    titleBaseline = null
    todoTextBaselines.clear()
    undoStack.value = []
    redoStack.value = []
  }

  function replaceDraft(note: Note) {
    draft.value = cloneNote(note)
    reset()
  }

  onBeforeUnmount(() => {
    clearTypingTimer()
  })

  return {
    canUndo,
    canRedo,
    beginTitleEdit,
    onTitleChange,
    endTitleEdit,
    beginTodoTextEdit,
    onTodoTextChange,
    endTodoTextEdit,
    recordTodoDone,
    recordTodoAdd,
    recordTodoRemove,
    undo,
    redo,
    reset,
    replaceDraft,
    flushPendingTyping,
  }
}
