<template>
  <article class="note-card">
    <div class="note-card__body">
      <h2 class="note-card__title">{{ displayTitle }}</h2>
      <ul v-if="previewTodos.length" class="note-card__todos">
        <li
          v-for="todo in previewTodos"
          :key="todo.id"
          class="note-card__todo"
        >
          {{ todo.text || 'Пустой пункт' }}
        </li>
        <li v-if="hiddenCount > 0" class="note-card__todo note-card__todo--more">
          ещё {{ hiddenCount }}…
        </li>
      </ul>
      <p v-else class="note-card__empty">Нет пунктов Todo</p>
    </div>
    <div class="note-card__actions">
      <DefaultButton
        label="Изменить"
        variant="soft"
        @click="$emit('edit', note.id)"
      />
      <DefaultButton
        label="Удалить"
        variant="soft"
        @click="$emit('delete', note.id)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Note } from '~/types/note'
import DefaultButton from '~/components/common/DefaultButton.vue'

const props = defineProps<{
  note: Note
  previewLimit?: number
}>()

defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const limit = computed(() => props.previewLimit ?? 3)

const displayTitle = computed(() => props.note.title.trim() || 'Без названия')

const previewTodos = computed(() => props.note.todos.slice(0, limit.value))

const hiddenCount = computed(() => Math.max(0, props.note.todos.length - limit.value))
</script>

<style scoped lang="scss">
.note-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border: 1px solid var(--color-black);
  border-radius: 12px;
  background-color: var(--color-white-light);
  transition: all 0.2s linear;
  &:hover {
    background-color: var(--color-accent);
    .note-card__todo {
      color: var(--color-black);
    }
  }
  &__title {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 12px;
  }
  &__todos {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  &__todo {
    font-size: 15px;
    line-height: 1.4;
    color: var(--color-dark-gray);
    padding-left: 14px;
    position: relative;
    &::before {
      content: '•';
      position: absolute;
      left: 0;
    }
    &--more {
      font-style: italic;
    }
  }
  &__empty {
    font-size: 15px;
    color: var(--color-dark-gray);
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: auto;
    .button {
      background-color: var(--color-white-light);
    }
  }
}
</style>
