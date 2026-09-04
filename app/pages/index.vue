<template>
  <div class="notes-page">
    <div class="notes-page__head">
      <h1>Заметки</h1>
      <DefaultButton
        label="Новая заметка"
        @click="goCreate"
      />
    </div>
    <p v-if="!notesStore.sortedNotes.length" class="notes-page__empty">
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
import { useNotesStore } from '~/stores/notesStore'
import { useConfirmDialog } from '~/composables/useConfirmDialog'

const notesStore = useNotesStore()
const router = useRouter()
const { confirm } = useConfirmDialog()

function goCreate() {
  router.push('/edit')
}

function goEdit(id: string) {
  router.push({ path: '/edit', query: { id } })
}

async function onDelete(id: string) {
  const ok = await confirm({
    title: 'Удалить заметку?',
    description: 'Восстановить удалённую заметку будет нельзя',
    confirmLabel: 'Удалить',
    cancelLabel: 'Отменить',
    action: 'deleteNote',
    noteId: id,
  })
  if (ok) {
    notesStore.remove(id)
  }
}

onMounted(() => {
  notesStore.hydrate()
})
</script>

<style scoped lang="scss">
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
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    gap: 18px; 
  }
}
</style>
