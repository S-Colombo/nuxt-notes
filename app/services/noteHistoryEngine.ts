import type { Note, TodoItem } from '../types/note'

export const HISTORY_LIMIT = 50
export const TYPING_PAUSE_MS = 600

/** Diff-only history entry — never a full note snapshot */
export type HistoryPatch =
  | { op: 'title'; before: string; after: string }
  | { op: 'todoText'; todoId: string; before: string; after: string }
  | { op: 'todoDone'; todoId: string; before: boolean; after: boolean }
  | { op: 'todoAdd'; todo: TodoItem; index: number }
  | { op: 'todoRemove'; todo: TodoItem; index: number }

export function applyPatch(note: Note, patch: HistoryPatch): void {
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

export function invertPatch(patch: HistoryPatch): HistoryPatch {
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

/**
 * Pure undo/redo engine: stores patches only (no full note copies).
 */
export class NoteHistoryEngine {
  undoStack: HistoryPatch[] = []
  redoStack: HistoryPatch[] = []

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  push(patch: HistoryPatch): void {
    if (isNoop(patch)) return
    this.undoStack.push(patch)
    if (this.undoStack.length > HISTORY_LIMIT) {
      this.undoStack.shift()
    }
    this.redoStack = []
  }

  undo(note: Note): boolean {
    const patch = this.undoStack.pop()
    if (!patch) return false
    applyPatch(note, invertPatch(patch))
    this.redoStack.push(patch)
    return true
  }

  redo(note: Note): boolean {
    const patch = this.redoStack.pop()
    if (!patch) return false
    applyPatch(note, patch)
    this.undoStack.push(patch)
    if (this.undoStack.length > HISTORY_LIMIT) {
      this.undoStack.shift()
    }
    return true
  }

  reset(): void {
    this.undoStack = []
    this.redoStack = []
  }
}
