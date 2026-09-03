<template>
  <div class="base-overlay">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

// когда оверлей монтируется — блокируем скролл
let scrollY = 0

onMounted(() => {
  lockScroll()
})

// когда оверлей удаляется — возвращаем всё обратно
onBeforeUnmount(() => {
  unlockScroll()
})

function lockScroll() {
  // сохраняем текущую позицию
  scrollY = window.scrollY

  // фиксируем body на месте
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  // убираем фиксацию
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''

  // восстанавливаем скролл
  window.scrollTo(0, scrollY)
}
</script>

<style scoped>
.base-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999998;
}
</style>
