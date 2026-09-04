import type { Ref } from 'vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Note, TodoItem } from '~/types/note'
import { cloneNote } from '~/types/note'
import {
  NoteHistoryEngine,
  TYPING_PAUSE_MS,
  type HistoryPatch,
} from '~/services/noteHistoryEngine'

export type { HistoryPatch }
export { HISTORY_LIMIT, TYPING_PAUSE_MS } from '~/services/noteHistoryEngine'

export function useNoteHistory(draft: Ref<Note>) {
  const engine = new NoteHistoryEngine()
  const undoStack = ref<HistoryPatch[]>(engine.undoStack)
  const redoStack = ref<HistoryPatch[]>(engine.redoStack)

  let titleBaseline: string | null = null
  const todoTextBaselines = new Map<string, string>()
  let typingTimer: ReturnType<typeof setTimeout> | null = null
  let pendingField: { kind: 'title' } | { kind: 'todoText'; todoId: string } | null = null

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function syncStacks() {
    undoStack.value = [...engine.undoStack]
    redoStack.value = [...engine.redoStack]
  }

  function clearTypingTimer() {
    if (typingTimer) {
      clearTimeout(typingTimer)
      typingTimer = null
    }
  }

  function pushPatch(patch: HistoryPatch) {
    engine.push(patch)
    syncStacks()
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
    engine.undo(draft.value)
    syncStacks()
    titleBaseline = null
    todoTextBaselines.clear()
  }

  function redo() {
    flushPendingTyping()
    engine.redo(draft.value)
    syncStacks()
    titleBaseline = null
    todoTextBaselines.clear()
  }

  function reset() {
    clearTypingTimer()
    pendingField = null
    titleBaseline = null
    todoTextBaselines.clear()
    engine.reset()
    syncStacks()
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
