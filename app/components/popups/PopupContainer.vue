<template>
  <Transition name="fade">
    <BaseOverlay v-if="isAnyOpen" />
  </Transition>

  <Transition name="slide">
    <component
      :is="activePopupComponent"
      v-if="activePopupComponent"
      :key="getActivePopup.popupId"
    />
  </Transition>
</template>

<script setup lang="ts">
import BaseOverlay from '~/components/common/popups/BaseOverlay.vue'
import { getActivePopup } from '~/globalStores/popupStore/popupStore'
import { PopupType } from '~/globalStores/popupStore/types'

const componentResolver: Partial<Record<PopupType, Component>> = {
  [PopupType.RemoveBonusePopup]: defineAsyncComponent(
    () => import('~/components/popups/RemoveBonusePopup.vue')
  ),
}

const isAnyOpen = computed(() => Boolean(getActivePopup.value?.popupId))

const activePopupComponent = computed((): Component | null => {
  const active = getActivePopup.value?.popupId
  if (!active) return null
  const component = componentResolver[active]
  return component ?? null
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
