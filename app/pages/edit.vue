<template>
  <div
    v-if="notFound"
    class="edit-page edit-page--not-found"
  >
    <h1>Заметка не найдена</h1>
    <p class="edit-page__empty">
      Заметки с таким адресом нет — возможно, она была удалена.
    </p>
    <DefaultButton
      label="К списку заметок"
      @click="router.push('/')"
    />
  </div>

  <div
    v-else
    class="edit-page"
  >
    <div class="edit-page__head">
      <h1>{{ isNew ? 'Новая заметка' : 'Редактирование' }}</h1>
      <div class="edit-page__toolbar">
        <DefaultButton
          label="Отменить изменение"
          variant="soft"
          :disabled="!canUndo"
          @click="history.undo()"
        />
        <DefaultButton
          label="Повторить изменение"
          variant="soft"
          :disabled="!canRedo"
          @click="history.redo()"
        />
        <DefaultButton
          label="Сохранить"
          @click="onSave"
        />
        <DefaultButton
          label="Отменить редактирование"
          variant="soft"
          @click="onCancelEdit"
        />
        <DefaultButton
          v-if="!isNew"
          label="Удалить"
          variant="soft"
          @click="onDelete"
        />
      </div>
    </div>

    <label class="edit-page__field">
      <span class="edit-page__label">Заголовок</span>
      <input
        v-model="draft.title"
        class="edit-page__input"
        type="text"
        placeholder="Название заметки"
        @focus="history.beginTitleEdit()"
        @input="onTitleInput"
        @blur="history.endTitleEdit()"
      >
    </label>

    <section class="edit-page__todos">
      <div class="edit-page__todos-head">
        <h2>Todo</h2>
        <DefaultButton
          label="Добавить пункт"
          variant="soft"
          @click="addTodo"
        />
      </div>
      <p
        v-if="!draft.todos.length"
        class="edit-page__empty"
      >
        Нет пунктов — добавьте первый.
      </p>
      <ul
        v-else
        class="edit-page__todo-list"
      >
        <li
          v-for="todo in draft.todos"
          :key="todo.id"
          class="todo-item"
        >
          <input
            class="todo-item__check"
            type="checkbox"
            :checked="todo.done"
            :aria-label="`Выполнено: ${todo.text || 'пункт'}`"
            @change="onToggleDone(todo.id, $event)"
          >
          <input
            v-model="todo.text"
            class="todo-item__text"
            type="text"
            placeholder="Текст пункта"
            @focus="history.beginTodoTextEdit(todo.id)"
            @input="onTodoTextInput(todo.id)"
            @blur="history.endTodoTextEdit(todo.id)"
          >
          <button
            type="button"
            class="todo-item__remove"
            aria-label="Удалить пункт"
            @click="removeTodo(todo.id)"
          >
            <NuxtIcon name="trash" />
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import DefaultButton from '~/components/common/DefaultButton.vue'
import { useNotesStore } from '~/stores/notesStore'
import { useNoteHistory } from '~/composables/useNoteHistory'
import { useConfirmDialog } from '~/composables/useConfirmDialog'
import { cloneNote, createEmptyNote, createTodo } from '~/types/note'
import type { Note } from '~/types/note'
import {
  clearDraftStorage,
  isDraftDirty,
  isDraftRelevant,
  loadDraftFromStorage,
  saveDraftToStorage,
} from '~/services/notesStorage'

const DRAFT_PERSIST_DELAY_MS = 800

const notesStore = useNotesStore()
const route = useRoute()
const router = useRouter()
const { confirm } = useConfirmDialog()

const draft = ref<Note>(createEmptyNote())
const savedSnapshot = ref('')
const notFound = ref(false)
const ready = ref(false)
const history = useNoteHistory(draft)

const canUndo = history.canUndo
const canRedo = history.canRedo

let draftPersistTimer: ReturnType<typeof setTimeout> | null = null
let handlingExternalDelete = false

const noteId = computed(() => {
  const raw = route.query.id
  return typeof raw === 'string' ? raw : null
})

const isNew = computed(() => !noteId.value || !notesStore.getById(noteId.value))

const isDirty = computed(() => JSON.stringify(draft.value) !== savedSnapshot.value)

function captureSnapshot() {
  savedSnapshot.value = JSON.stringify(draft.value)
}

function clearDraftPersistTimer() {
  if (draftPersistTimer) {
    clearTimeout(draftPersistTimer)
    draftPersistTimer = null
  }
}

function persistDraftNow() {
  if (!ready.value || notFound.value) return
  if (!isDirty.value) {
    clearDraftStorage()
    return
  }
  saveDraftToStorage({
    routeNoteId: noteId.value,
    draft: cloneNote(draft.value),
    baseSnapshot: savedSnapshot.value,
  })
}

function scheduleDraftPersist() {
  clearDraftPersistTimer()
  draftPersistTimer = setTimeout(() => {
    persistDraftNow()
  }, DRAFT_PERSIST_DELAY_MS)
}

function discardSessionDraft() {
  clearDraftPersistTimer()
  clearDraftStorage()
}

async function maybeRestoreDraft(): Promise<boolean> {
  const stored = loadDraftFromStorage()
  if (!stored || !isDraftRelevant(stored, noteId.value) || !isDraftDirty(stored)) {
    return false
  }

  const showPopup = await confirm({
    title: 'Восстановить черновик?',
    description: 'Найдены несохранённые изменения после перезагрузки страницы',
    confirmLabel: 'Восстановить',
    cancelLabel: 'Отклонить',
    action: 'restoreDraft',
    noteId: stored.draft.id,
  })

  if (showPopup) {
    history.replaceDraft(stored.draft)
    savedSnapshot.value = stored.baseSnapshot
    return true
  }

  clearDraftStorage()
  return false
}

async function loadDraft() {
  ready.value = false
  notFound.value = false
  notesStore.hydrate()

  const id = noteId.value

  if (id) {
    const existing = notesStore.getById(id)
    if (!existing) {
      notFound.value = true
      discardSessionDraft()
      ready.value = true
      return
    }
    history.replaceDraft(existing)
    captureSnapshot()
  } else {
    history.replaceDraft(createEmptyNote())
    captureSnapshot()
  }

  await maybeRestoreDraft()
  ready.value = true
}

function onTitleInput() {
  history.onTitleChange()
  scheduleDraftPersist()
}

function onTodoTextInput(todoId: string) {
  history.onTodoTextChange(todoId)
  scheduleDraftPersist()
}

function addTodo() {
  const todo = createTodo()
  const index = draft.value.todos.length
  draft.value.todos.push(todo)
  history.recordTodoAdd(todo, index)
  scheduleDraftPersist()
}

function removeTodo(todoId: string) {
  const index = draft.value.todos.findIndex(item => item.id === todoId)
  if (index === -1) return
  const [removed] = draft.value.todos.splice(index, 1)
  if (removed) {
    history.recordTodoRemove(removed, index)
    scheduleDraftPersist()
  }
}

function onToggleDone(todoId: string, event: Event) {
  const target = event.target as HTMLInputElement
  const todo = draft.value.todos.find(item => item.id === todoId)
  if (!todo) return
  const before = todo.done
  const after = target.checked
  todo.done = after
  history.recordTodoDone(todoId, before, after)
  scheduleDraftPersist()
}

function onSave() {
  history.flushPendingTyping()
  const toSave = cloneNote(draft.value)
  if (!toSave.title.trim() && !toSave.todos.some(t => t.text.trim())) {
    toSave.title = 'Без названия'
  }
  notesStore.upsert(toSave)
  history.reset()
  captureSnapshot()
  discardSessionDraft()
  router.replace({ path: '/edit', query: { id: toSave.id } })
}

async function onCancelEdit() {
  history.flushPendingTyping()
  const showPopup = await confirm({
    title: 'Отменить редактирование?',
    description: isDirty.value
      ? 'Несохранённые изменения будут потеряны'
      : 'Вы вернётесь к списку заметок',
    confirmLabel: 'Отменить редактирование',
    cancelLabel: 'Остаться',
    action: 'cancelEdit',
    noteId: draft.value.id,
  })
  if (!showPopup) return
  history.reset()
  discardSessionDraft()
  router.push('/')
}

async function onDelete() {
  const showPopup = await confirm({
    title: 'Удалить заметку?',
    description: 'Восстановить удалённую заметку будет нельзя',
    confirmLabel: 'Удалить',
    cancelLabel: 'Отменить',
    action: 'deleteNote',
    noteId: draft.value.id,
  })
  if (!showPopup) return
  notesStore.remove(draft.value.id)
  history.reset()
  discardSessionDraft()
  router.push('/')
}

async function handleExternalDelete() {
  if (handlingExternalDelete || notFound.value) return
  const id = noteId.value
  if (!id) return
  if (notesStore.getById(id)) return

  handlingExternalDelete = true
  discardSessionDraft()
  notFound.value = true
  history.reset()

  await confirm({
    title: 'Заметка удалена',
    description: 'Эта заметка была удалена в другой вкладке',
    confirmLabel: 'К списку',
    cancelLabel: 'Закрыть',
    action: 'noteDeletedExternally',
    noteId: id,
  })

  handlingExternalDelete = false
  router.push('/')
}

function onStorage(event: StorageEvent) {
  notesStore.syncFromStorageEvent(event)
  void handleExternalDelete()
}

function onPageHide() {
  if (ready.value && !notFound.value && isDirty.value) {
    persistDraftNow()
  }
}

function onKeydown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  const mod = event.ctrlKey || event.metaKey
  if (!mod) return

  if (key === 'z' && event.shiftKey) {
    event.preventDefault()
    history.redo()
    return
  }
  if (key === 'z') {
    event.preventDefault()
    history.undo()
    return
  }
  if (key === 'y') {
    event.preventDefault()
    history.redo()
  }
}

onMounted(async () => {
  await loadDraft()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('storage', onStorage)
  window.addEventListener('pagehide', onPageHide)
})

watch(noteId, () => {
  void loadDraft()
})

onBeforeUnmount(() => {
  clearDraftPersistTimer()
  onPageHide()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('pagehide', onPageHide)
})
</script>

<style scoped lang="scss">
.edit-page {
  display: flex;
  flex-direction: column;
  gap: 28px;

  &--not-found {
    align-items: flex-start;
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    color: var(--color-dark-gray);
  }

  &__input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--color-gray);
    border-radius: 8px;
    background: var(--color-white-light);
    outline: none;

    &:focus {
      border-color: var(--color-black);
    }
  }

  &__todos-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    h2 {
      font-size: 20px;
      font-weight: 600;
    }
  }

  &__empty {
    color: var(--color-dark-gray);
  }

  &__todo-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;

  &__check {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
    cursor: pointer;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--color-gray);
    border-radius: 8px;
    background: var(--color-white-light);
    outline: none;

    &:focus {
      border-color: var(--color-black);
    }
  }

  &__remove {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: 1px solid var(--color-gray);
    border-radius: 8px;
    background: transparent;
    color: var(--color-dark-gray);
    cursor: pointer;

    &:hover {
      color: var(--color-danger);
      border-color: var(--color-danger);
    }
  }
}
</style>
