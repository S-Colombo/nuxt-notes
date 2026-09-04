import { describe, expect, it } from 'vitest'
import {
  HISTORY_LIMIT,
  NoteHistoryEngine,
  applyPatch,
  invertPatch,
} from '../../app/services/noteHistoryEngine'
import type { Note, TodoItem } from '../../app/types/note'

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Title',
    todos: [],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

function makeTodo(overrides: Partial<TodoItem> = {}): TodoItem {
  return {
    id: 'todo-1',
    text: 'Buy milk',
    done: false,
    ...overrides,
  }
}

describe('NoteHistoryEngine', () => {
  it('records title change as a single patch and undoes/redoes it', () => {
    const note = makeNote({ title: 'A' })
    const engine = new NoteHistoryEngine()

    engine.push({ op: 'title', before: 'A', after: 'ABC' })
    applyPatch(note, { op: 'title', before: 'A', after: 'ABC' })
    expect(note.title).toBe('ABC')
    expect(engine.undoStack).toHaveLength(1)

    engine.undo(note)
    expect(note.title).toBe('A')
    expect(engine.canRedo).toBe(true)

    engine.redo(note)
    expect(note.title).toBe('ABC')
  })

  it('treats checkbox / add / remove as separate atomic entries', () => {
    const todo = makeTodo()
    const note = makeNote({ todos: [todo] })
    const engine = new NoteHistoryEngine()

    engine.push({ op: 'todoDone', todoId: todo.id, before: false, after: true })
    applyPatch(note, { op: 'todoDone', todoId: todo.id, before: false, after: true })

    const added = makeTodo({ id: 'todo-2', text: 'New' })
    engine.push({ op: 'todoAdd', todo: added, index: 1 })
    applyPatch(note, { op: 'todoAdd', todo: added, index: 1 })

    engine.push({ op: 'todoRemove', todo: { ...added }, index: 1 })
    applyPatch(note, { op: 'todoRemove', todo: { ...added }, index: 1 })

    expect(engine.undoStack).toHaveLength(3)
    expect(note.todos).toHaveLength(1)
    expect(note.todos[0]?.done).toBe(true)

    engine.undo(note)
    expect(note.todos).toHaveLength(2)

    engine.undo(note)
    expect(note.todos).toHaveLength(1)

    engine.undo(note)
    expect(note.todos[0]?.done).toBe(false)
  })

  it('clears redo branch after a new change following undo', () => {
    const note = makeNote({ title: 'A' })
    const engine = new NoteHistoryEngine()

    engine.push({ op: 'title', before: 'A', after: 'B' })
    applyPatch(note, { op: 'title', before: 'A', after: 'B' })
    engine.push({ op: 'title', before: 'B', after: 'C' })
    applyPatch(note, { op: 'title', before: 'B', after: 'C' })

    engine.undo(note)
    expect(engine.canRedo).toBe(true)

    engine.push({ op: 'title', before: 'B', after: 'D' })
    applyPatch(note, { op: 'title', before: 'B', after: 'D' })

    expect(engine.canRedo).toBe(false)
    expect(engine.redoStack).toHaveLength(0)
    expect(note.title).toBe('D')
  })

  it('limits history to 50 patches without storing full note copies', () => {
    const note = makeNote({ title: '0' })
    const engine = new NoteHistoryEngine()

    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      const before = String(i)
      const after = String(i + 1)
      engine.push({ op: 'title', before, after })
      note.title = after
    }

    expect(engine.undoStack).toHaveLength(HISTORY_LIMIT)
    // Patches are diffs, not full notes
    for (const patch of engine.undoStack) {
      expect(patch.op).toBe('title')
      expect(patch).not.toHaveProperty('todos')
      expect(Object.keys(patch).sort()).toEqual(['after', 'before', 'op'])
    }
  })

  it('ignores noop patches', () => {
    const engine = new NoteHistoryEngine()
    engine.push({ op: 'title', before: 'Same', after: 'Same' })
    engine.push({ op: 'todoDone', todoId: 't1', before: true, after: true })
    expect(engine.undoStack).toHaveLength(0)
  })

  it('reset clears undo and redo stacks', () => {
    const note = makeNote({ title: 'A' })
    const engine = new NoteHistoryEngine()
    engine.push({ op: 'title', before: 'A', after: 'B' })
    applyPatch(note, { op: 'title', before: 'A', after: 'B' })
    engine.undo(note)
    engine.reset()
    expect(engine.canUndo).toBe(false)
    expect(engine.canRedo).toBe(false)
  })

  it('invertPatch reverses add/remove and field changes', () => {
    const todo = makeTodo()
    expect(invertPatch({ op: 'todoAdd', todo, index: 0 })).toEqual({
      op: 'todoRemove',
      todo,
      index: 0,
    })
    expect(invertPatch({ op: 'title', before: 'a', after: 'b' })).toEqual({
      op: 'title',
      before: 'b',
      after: 'a',
    })
  })
})
