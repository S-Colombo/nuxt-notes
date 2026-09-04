import type { Note } from '~/types/note'

const STORAGE_KEY = 'notes-app-data'

export function loadNotesFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isValidNote)
  } catch {
    return []
  }
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // Quota / private mode — ignore; in-memory store still works
  }
}

function isValidNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object') return false
  const note = value as Partial<Note>
  return (
    typeof note.id === 'string'
    && typeof note.title === 'string'
    && Array.isArray(note.todos)
    && typeof note.createdAt === 'number'
    && typeof note.updatedAt === 'number'
  )
}
