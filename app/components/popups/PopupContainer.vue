<template>
  <Transition name="slide">
    <component
      :is="activePopupComponent"
      v-if="activePopupComponent"
      :key="getActivePopup.popupId"
    />
  </Transition>
</template>

<script setup lang="ts">
import { getActivePopup } from '~/globalStores/popupStore/popupStore'
import { PopupType } from '~/globalStores/popupStore/types'

const componentResolver: Partial<Record<PopupType, Component>> = {
  [PopupType.CheckConfirmPopup]: defineAsyncComponent(
    () => import('~/components/popups/CheckConfirmPopup.vue')
  ),
}

const activePopupComponent = computed((): Component | null => {
  const active = getActivePopup.value?.popupId
  if (!active) return null
  return componentResolver[active] ?? null
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  @media (max-width: 743px) {
    transform: translateY(0);
    transition: all 0.3s ease;
  }
}

.slide-enter-from,
.slide-leave-to {
  @media (max-width: 743px) {
    transform: translateY(100%);
  }
}
</style>
