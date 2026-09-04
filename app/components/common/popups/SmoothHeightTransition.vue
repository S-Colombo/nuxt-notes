<template>
  <div
    ref="wrapper"
    class="smooth-height-wrapper"
  >
    <div
      ref="inner"
      class="smooth-height-inner"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { ScreenSize } from '~/utils/screenSize'

const wrapper = ref<HTMLElement | null>(null)
const inner = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
let initialized = false

onMounted(() => {
  const wrap = wrapper.value
  const innerEl = inner.value
  if (!wrap || !innerEl) return

  const MIN_HEIGHT = 180
  const MAX_HEIGHT = window.innerWidth >= ScreenSize.MD ? window.innerHeight - 80 : window.innerHeight - 24

  // начальная высота (при загрузке)
  wrap.style.height = MIN_HEIGHT + 'px'

  observer = new ResizeObserver(() => {
    const contentHeight = innerEl.scrollHeight
    const clampedHeight = Math.min(contentHeight, MAX_HEIGHT)
    const currentHeight = wrap.offsetHeight

    // пропускаем первую инициализацию
    if (!initialized) {
      initialized = true
      wrap.style.height = clampedHeight + 'px'
      return
    }

    if (Math.abs(clampedHeight - currentHeight) > 1) {
      wrap.style.transition = 'height 0.3s ease'
      wrap.style.overflow = 'hidden'

      wrap.style.height = currentHeight + 'px'

      requestAnimationFrame(() => {
        wrap.style.height = clampedHeight + 'px'
      })

      wrap.addEventListener(
        'transitionend',
        () => {
          wrap.style.height = 'auto'
          wrap.style.transition = ''
          wrap.style.overflow = ''
        },
        { once: true }
      )
    }
  })

  observer.observe(innerEl)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.smooth-height-wrapper {
  overflow: hidden;
}

.smooth-height-inner {
  max-height: calc(100dvh - 24px);
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .smooth-height-inner {
    max-height: calc(100dvh - 80px);
  }
}
</style>
