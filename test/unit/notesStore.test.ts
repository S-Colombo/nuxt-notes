import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotesStore } from '../../app/stores/notesStore'
import {
  DRAFT_STORAGE_KEY,
  NOTES_SCHEMA_VERSION,
  NOTES_STORAGE_KEY,
  clearDraftStorage,
  isDraftDirty,
  isDraftRelevant,
  loadDraftFromStorage,
  loadNotesFromStorage,
  saveDraftToStorage,
  saveNotesToStorage,
} from '../../app/services/notesStorage'
import type { Note } from '../../app/types/note'

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Hello',
    todos: [{ id: 't1', text: 'One', done: false }],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }
}

describe('notesStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('persists notes with schema version', () => {
    const notes = [makeNote()]
    saveNotesToStorage(notes)

    const raw = localStorage.getItem(NOTES_STORAGE_KEY)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!) as { version: number, notes: Note[] }
    expect(parsed.version).toBe(NOTES_SCHEMA_VERSION)
    expect(parsed.notes).toHaveLength(1)
    expect(parsed.notes[0]?.title).toBe('Hello')
  })

  it('loads versioned payload and migrates legacy bare arrays', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([makeNote({ title: 'Legacy' })]))
    expect(loadNotesFromStorage()[0]?.title).toBe('Legacy')

    saveNotesToStorage([makeNote({ title: 'Versioned' })])
    expect(loadNotesFromStorage()[0]?.title).toBe('Versioned')
  })

  it('rejects unknown schema versions', () => {
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({ version: 999, notes: [makeNote()] }),
    )
    expect(loadNotesFromStorage()).toEqual([])
  })

  it('stores and clears session draft without writing on empty dirty check helpers', () => {
    const draft = makeNote({ title: 'Draft' })
    const baseSnapshot = JSON.stringify(makeNote({ title: 'Saved' }))

    saveDraftToStorage({
      routeNoteId: 'note-1',
      draft,
      baseSnapshot,
    })

    const loaded = loadDraftFromStorage()
    expect(loaded?.version).toBe(NOTES_SCHEMA_VERSION)
    expect(loaded?.draft.title).toBe('Draft')
    expect(isDraftDirty(loaded!)).toBe(true)
    expect(isDraftRelevant(loaded!, 'note-1')).toBe(true)
    expect(isDraftRelevant(loaded!, 'other')).toBe(false)

    clearDraftStorage()
    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
    expect(loadDraftFromStorage()).toBeNull()
  })
})

describe('useNotesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('hydrates from localStorage and persists only on upsert/remove', () => {
    saveNotesToStorage([makeNote({ id: 'a', title: 'Stored' })])

    const store = useNotesStore()
    store.hydrate(true)

    expect(store.notes).toHaveLength(1)
    expect(store.getById('a')?.title).toBe('Stored')

    store.upsert(makeNote({ id: 'b', title: 'New', updatedAt: 50 }))
    expect(loadNotesFromStorage().map(n => n.id).sort()).toEqual(['a', 'b'])

    store.remove('b')
    expect(loadNotesFromStorage().map(n => n.id)).toEqual(['a'])
  })

  it('does not write localStorage until upsert/remove is called', () => {
    const store = useNotesStore()
    store.hydrate(true)
    localStorage.removeItem(NOTES_STORAGE_KEY)

    // In-memory-only change (edit flow keeps a separate draft)
    store.notes.push(makeNote({ id: 'temp', title: 'Temp' }))
    expect(localStorage.getItem(NOTES_STORAGE_KEY)).toBeNull()

    store.upsert(makeNote({ id: 'saved', title: 'Saved' }))
    expect(localStorage.getItem(NOTES_STORAGE_KEY)).toBeTruthy()
  })

  it('syncs from storage events (cross-tab delete) without throwing', () => {
    saveNotesToStorage([
      makeNote({ id: 'keep', title: 'Keep' }),
      makeNote({ id: 'gone', title: 'Gone' }),
    ])

    const store = useNotesStore()
    store.hydrate(true)
    expect(store.notes).toHaveLength(2)

    // Other tab saved only "keep"
    saveNotesToStorage([makeNote({ id: 'keep', title: 'Keep' })])
    store.syncFromStorageEvent(
      new StorageEvent('storage', {
        key: NOTES_STORAGE_KEY,
        newValue: localStorage.getItem(NOTES_STORAGE_KEY),
      }),
    )

    expect(store.getById('gone')).toBeUndefined()
    expect(store.getById('keep')).toBeTruthy()
    expect(() => store.remove('gone')).not.toThrow()
  })

  it('sortedNotes orders by updatedAt desc', () => {
    const store = useNotesStore()
    store.hydrate(true)
    store.upsert(makeNote({ id: 'old', title: 'Old', updatedAt: 1 }))
    store.upsert(makeNote({ id: 'new', title: 'New', updatedAt: 2 }))

    expect(store.sortedNotes.map(n => n.id)).toEqual(['new', 'old'])
  })
})
