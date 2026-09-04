<template>
  <div class="notes-page">
    <div class="notes-page__head">
      <h1>Заметки</h1>
      <DefaultButton
        label="Новая заметка"
        @click="goCreate"
      />
    </div>
    <div v-if="isLoading" class="notes-page__loader">
      <BaseLoading class="loader-icon" :size="50" />
    </div>
    <p v-else-if="!notesStore.sortedNotes.length" class="notes-page__empty">
      Пока нет заметок. Создайте первую.
    </p>
    <div v-else class="notes-page__list">
      <NoteCard
        v-for="note in notesStore.sortedNotes"
        :key="note.id"
        :note="note"
        @edit="goEdit"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NoteCard from '~/components/NoteCard.vue'
import DefaultButton from '~/components/common/DefaultButton.vue'
import BaseLoading from '~/components/common/BaseLoading.vue'
import { useNotesStore } from '~/stores/notesStore'
import { useConfirmDialog } from '~/composables/useConfirmDialog'

const notesStore = useNotesStore()
const router = useRouter()
const { confirm } = useConfirmDialog()
const isLoading = ref<boolean>(true);

function goCreate() {
  router.push('/edit')
}

function goEdit(id: string) {
  router.push({ path: '/edit', query: { id } })
}

async function onDelete(id: string) {
  const showPopup = await confirm({
    title: 'Удалить заметку?',
    description: 'Восстановить удалённую заметку будет нельзя',
    confirmLabel: 'Удалить',
    cancelLabel: 'Отменить',
    action: 'deleteNote',
    noteId: id,
  })
  if (showPopup) {
    notesStore.remove(id)
  }
}

onMounted(() => {
  notesStore.hydrate()
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@use "~/assets/styles/mixins" as *;

.notes-page {
  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
  }
  &__empty {
    color: var(--color-dark-gray);
    font-size: 16px;
    line-height: 1.5;
  }
  &__list {
    gap: 18px;
    @include breakpointMax(767px) {
      display: flex;
      flex-direction: column;
    }
    @include breakpointMin(768px) {
      display: grid;
      grid-template-columns: repeat(3, 1fr); 
    }
  }
  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 256px;
  }
}
</style>
