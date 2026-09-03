<template>
  <div>
    <nuxt-icon
      class="base-loading"
      name="base-loading"
      :style="{ '--size': size ? size + 'px' : '24px' }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>

<style scoped>
:deep(.nuxt-icon.base-loading) {
  --size: 24px;
}

:deep(.nuxt-icon.base-loading svg) {
  font-size: var(--size);
  width: var(--size);
  height: var(--size);
}

:deep(.nuxt-icon.base-loading svg .dot)  {
  color: var(--bg-level);
  fill-opacity: 1;
  animation: dot-color 1.2s linear infinite;
}

@keyframes dot-color {
  0% { color: var(--secondary-default);}
  20% { color: var(--bg-level);}
}

:deep(.nuxt-icon.base-loading svg .dot-1)  { animation-delay: 0s; }
:deep(.nuxt-icon.base-loading svg .dot-2)  { animation-delay: 0.15s; }
:deep(.nuxt-icon.base-loading svg .dot-3)  { animation-delay: 0.3s; }
:deep(.nuxt-icon.base-loading svg .dot-4)  { animation-delay: 0.45s; }
:deep(.nuxt-icon.base-loading svg .dot-5)  { animation-delay: 0.60s; }
:deep(.nuxt-icon.base-loading svg .dot-6)  { animation-delay: 0.75s; }
:deep(.nuxt-icon.base-loading svg .dot-7)  { animation-delay: 0.90s; }
:deep(.nuxt-icon.base-loading svg .dot-8)  { animation-delay: 1.05s; }
</style>
