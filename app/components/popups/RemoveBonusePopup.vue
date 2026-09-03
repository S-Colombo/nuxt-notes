<template>
  <PopupLoader v-if="getIsLoading" />
  <BasePopup
    class="remove-bonuse-popup"
    :width="428"
    :show-icon-cross="false"
    :use-perfect-scrollbar="false"
  >
    <template #title>
      <div class="remove-bonuse-popup__title">
        {{ data.title }}
      </div>
    </template>
    <template #content>
      <div class="remove-bonuse-popup__content-wrapper">
        <div class="remove-bonuse-popup__description">
          Восстановить удаленные файлы будет нельзя
        </div>
        <div class="remove-bonuse-popup__buttons">
          <DefaultButton
            class="remove-bonuse-popup__button"
            btn-type="button"
            variant="soft"
            label="Удалить"
            @click="handleConfirm"
          />
          <DefaultButton
            class="remove-bonuse-popup__button"
            btn-type="button"
            label="Отменить"
            @click="closePopup()"
          />
        </div>
      </div>
    </template>
  </BasePopup>
</template>

<script setup lang="ts">
import BasePopup from '~/components/common/popups/BasePopup.vue'
import PopupLoader from '~/components/common/popups/PopupLoader.vue'
import DefaultButton from '~/components/common/DefaultButton.vue'
import { getIsLoading, getActivePopup, setResponse, closePopup } from '~/globalStores/popupStore/popupStore'
import type { PopupParams, PopupType } from '~/globalStores/popupStore/types'

const data = getActivePopup.value.params as PopupParams[PopupType.RemoveBonusePopup]

function handleConfirm() {
  if (data.taskId) {
    setResponse({ action: 'removeTask', taskId: data.taskId })
  } else setResponse({ action: 'removeAll' })
  closePopup()
}
</script>

<style scoped>
:deep(.base-popup) {
  min-height: auto;
}
:deep(.base-popup__header) {
  padding-bottom: 0;
}
:deep(.base-popup__content) {
  padding-top: 20px;
}

.remove-bonuse-popup__title {
  width: 100%;
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
  text-align: center;
}

.remove-bonuse-popup__content-wrapper {
  display: flex;
  flex-direction: column;
  row-gap: 32px;
  width: 100%;
}

.remove-bonuse-popup__description {
  font-size: 18px;
  font-weight: 400;
  line-height: 28px;
  color: var(--fg-muted);
  text-align: center;
}

.remove-bonuse-popup__buttons {
  display: flex;
  gap: 12px;
}

.remove-bonuse-popup__button {
  flex: 1 1 0;
}
</style>
