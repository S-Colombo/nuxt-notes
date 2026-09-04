<template>
  <NuxtLayout>
    <main class="main">
      <NuxtPage
        :transition="{
          name: 'page',
          mode: 'out-in',
        }"
      />
    </main>
    <PopupContainer />
  </NuxtLayout>
</template>

<script setup lang="ts">
import PopupContainer from '~/components/popups/PopupContainer.vue'
</script>

<style scoped lang="scss">
@use "~/assets/styles/mixins" as *;

.main {
  width: 100%;
  padding: 40px 16px;
}
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>