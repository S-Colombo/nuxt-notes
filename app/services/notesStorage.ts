import type { Note } from '../types/note'

export const NOTES_STORAGE_KEY = 'notes-app-data'
export const DRAFT_STORAGE_KEY = 'notes-app-draft'
export const NOTES_SCHEMA_VERSION = 1 as const

export interface NotesStoragePayload {
  version: typeof NOTES_SCHEMA_VERSION
  notes: Note[]
}

export interface DraftStoragePayload {
  version: typeof NOTES_SCHEMA_VERSION
  /** Route query id when editing existing note; null for /edit without id */
  routeNoteId: string | null
  draft: Note
  /** JSON snapshot of last saved/loaded baseline (for dirty detection) */
  baseSnapshot: string
  updatedAt: number
}

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined'
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

function parseNotesPayload(raw: string): Note[] {
  const parsed = JSON.parse(raw) as unknown

  // Legacy: bare array without schema version
  if (Array.isArray(parsed)) {
    return parsed.filter(isValidNote)
  }

  if (!parsed || typeof parsed !== 'object') return []

  const payload = parsed as Partial<NotesStoragePayload>
  if (payload.version !== NOTES_SCHEMA_VERSION) return []
  if (!Array.isArray(payload.notes)) return []
  return payload.notes.filter(isValidNote)
}

export function loadNotesFromStorage(): Note[] {
  if (!canUseStorage()) return []

  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY)
    if (!raw) return []
    return parseNotesPayload(raw)
  } catch {
    return []
  }
}

/** Persist notes only on explicit save/delete — never on each keystroke. */
export function saveNotesToStorage(notes: Note[]): void {
  if (!canUseStorage()) return

  try {
    const payload: NotesStoragePayload = {
      version: NOTES_SCHEMA_VERSION,
      notes,
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / private mode — ignore; in-memory store still works
  }
}

export function loadDraftFromStorage(): DraftStoragePayload | null {
  if (!canUseSessionStorage()) return null

  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DraftStoragePayload>
    if (parsed.version !== NOTES_SCHEMA_VERSION) return null
    if (!isValidNote(parsed.draft)) return null
    if (typeof parsed.baseSnapshot !== 'string') return null
    if (typeof parsed.updatedAt !== 'number') return null
    if (parsed.routeNoteId !== null && typeof parsed.routeNoteId !== 'string') return null

    return {
      version: NOTES_SCHEMA_VERSION,
      routeNoteId: parsed.routeNoteId ?? null,
      draft: parsed.draft,
      baseSnapshot: parsed.baseSnapshot,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

export function saveDraftToStorage(payload: Omit<DraftStoragePayload, 'version' | 'updatedAt'>): void {
  if (!canUseSessionStorage()) return

  try {
    const next: DraftStoragePayload = {
      version: NOTES_SCHEMA_VERSION,
      routeNoteId: payload.routeNoteId,
      draft: payload.draft,
      baseSnapshot: payload.baseSnapshot,
      updatedAt: Date.now(),
    }
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function clearDraftStorage(): void {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function isDraftRelevant(
  draft: DraftStoragePayload,
  routeNoteId: string | null,
): boolean {
  if (draft.routeNoteId === routeNoteId) return true
  // New-note draft: route has no id, draft was also for create flow
  if (routeNoteId === null && draft.routeNoteId === null) return true
  return false
}

export function isDraftDirty(draft: DraftStoragePayload): boolean {
  return JSON.stringify(draft.draft) !== draft.baseSnapshot
}
