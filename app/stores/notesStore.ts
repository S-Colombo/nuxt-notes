import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { cloneNote, type Note } from '~/types/note'
import {
  loadNotesFromStorage,
  NOTES_STORAGE_KEY,
  saveNotesToStorage,
} from '~/services/notesStorage'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const hydrated = ref(false)

  function hydrate(force = false) {
    if (!import.meta.client) return
    if (hydrated.value && !force) return
    notes.value = loadNotesFromStorage()
    hydrated.value = true
  }

  function persist() {
    if (!hydrated.value) return
    saveNotesToStorage(notes.value)
  }

  function getById(id: string): Note | undefined {
    return notes.value.find(note => note.id === id)
  }

  function upsert(note: Note) {
    const next = cloneNote(note)
    next.updatedAt = Date.now()
    const index = notes.value.findIndex(item => item.id === next.id)
    if (index === -1) {
      notes.value.unshift(next)
    } else {
      notes.value[index] = next
    }
    persist()
  }

  function remove(id: string) {
    notes.value = notes.value.filter(note => note.id !== id)
    persist()
  }

  /** Sync from another tab's localStorage write without breaking the editor. */
  function syncFromStorageEvent(event: StorageEvent) {
    if (event.key !== NOTES_STORAGE_KEY) return
    hydrate(true)
  }

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  if (import.meta.client) {
    hydrate()
  }

  return {
    notes,
    sortedNotes,
    hydrated,
    hydrate,
    getById,
    upsert,
    remove,
    syncFromStorageEvent,
  }
})
