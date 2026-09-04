<template>
  <div class="edit-page">
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
        @input="history.onTitleChange()"
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
      <p v-if="!draft.todos.length" class="edit-page__empty">Нет пунктов — добавьте первый.</p>
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
            @input="history.onTodoTextChange(todo.id)"
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

const notesStore = useNotesStore()
const route = useRoute()
const router = useRouter()
const { confirm } = useConfirmDialog()

const draft = ref<Note>(createEmptyNote())
const savedSnapshot = ref<string>('')
const history = useNoteHistory(draft)

const canUndo = history.canUndo
const canRedo = history.canRedo

const noteId = computed(() => {
  const raw = route.query.id
  return typeof raw === 'string' ? raw : null
})

const isNew = computed(() => !noteId.value || !notesStore.getById(noteId.value))

const isDirty = computed(() => JSON.stringify(draft.value) !== savedSnapshot.value)

function captureSnapshot() {
  savedSnapshot.value = JSON.stringify(draft.value)
}

function loadDraft() {
  notesStore.hydrate()
  const id = noteId.value
  if (id) {
    const existing = notesStore.getById(id)
    if (existing) {
      history.replaceDraft(existing)
      captureSnapshot()
      return
    }
  }
  history.replaceDraft(createEmptyNote())
  captureSnapshot()
}

onMounted(() => {
  loadDraft()
})

watch(noteId, () => {
  loadDraft()
})

function addTodo() {
  const todo = createTodo()
  const index = draft.value.todos.length
  draft.value.todos.push(todo)
  history.recordTodoAdd(todo, index)
}

function removeTodo(todoId: string) {
  const index = draft.value.todos.findIndex(item => item.id === todoId)
  if (index === -1) return
  const [removed] = draft.value.todos.splice(index, 1)
  if (removed) {
    history.recordTodoRemove(removed, index)
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
  router.replace({ path: '/edit', query: { id: toSave.id } })
}

async function onCancelEdit() {
  history.flushPendingTyping()
  const ok = await confirm({
    title: 'Отменить редактирование?',
    description: isDirty.value
      ? 'Несохранённые изменения будут потеряны'
      : 'Вы вернётесь к списку заметок',
    confirmLabel: 'Отменить редактирование',
    cancelLabel: 'Остаться',
    action: 'cancelEdit',
    noteId: draft.value.id,
  })
  if (!ok) return
  history.reset()
  router.push('/')
}

async function onDelete() {
  const ok = await confirm({
    title: 'Удалить заметку?',
    description: 'Восстановить удалённую заметку будет нельзя',
    confirmLabel: 'Удалить',
    cancelLabel: 'Отменить',
    action: 'deleteNote',
    noteId: draft.value.id,
  })
  if (!ok) return
  notesStore.remove(draft.value.id)
  history.reset()
  router.push('/')
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

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped lang="scss">
.edit-page {
  display: flex;
  flex-direction: column;
  gap: 28px;

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
