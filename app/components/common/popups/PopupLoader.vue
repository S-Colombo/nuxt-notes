<template>
  <div
    class="popup-loader"
    @click="closePopup()"
  >
    <BaseLoading :size="25" />
  </div>
</template>

<script setup lang="ts">
import BaseLoading from '~/components/common/BaseLoading.vue'
import { closePopup } from '~/globalStores/popupStore/popupStore'
</script>

<style scoped>
.popup-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(12px);
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999999;
}
</style>
