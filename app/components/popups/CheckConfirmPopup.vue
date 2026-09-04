<template>
  <PopupLoader v-if="getIsLoading" />
  <BasePopup
    class="check-confirm-popup"
    :width="428"
    :show-icon-cross="false"
    :use-perfect-scrollbar="false"
  >
    <template #title>
      <div class="check-confirm-popup__title">
        {{ data.title }}
      </div>
    </template>
    <template #content>
      <div class="check-confirm-popup__content-wrapper">
        <div class="check-confirm-popup__description">
          {{ data.description || 'Это действие нельзя отменить' }}
        </div>
        <div class="check-confirm-popup__buttons">
          <DefaultButton
            class="check-confirm-popup__button"
            btn-type="button"
            variant="soft"
            :label="data.confirmLabel || 'Подтвердить'"
            @click="handleConfirm"
          />
          <DefaultButton
            class="check-confirm-popup__button"
            btn-type="button"
            :label="data.cancelLabel || 'Отменить'"
            @click="handleCancel"
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

const data = getActivePopup.value.params as PopupParams[PopupType.CheckConfirmPopup]

function handleConfirm() {
  setResponse({
    confirmed: 'true',
    action: data.action,
    ...(data.noteId ? { noteId: data.noteId } : {}),
  })
  closePopup()
}

function handleCancel() {
  setResponse({ confirmed: 'false' })
  closePopup()
}
</script>

<style scoped lang="scss">
:deep(.base-popup) {
  min-height: auto;
}

:deep(.base-popup__header) {
  padding-bottom: 0;
}

:deep(.base-popup__content) {
  padding-top: 20px;
}

.check-confirm-popup__title {
  width: 100%;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  text-align: center;
  color: var(--color-black);
}

.check-confirm-popup__content-wrapper {
  display: flex;
  flex-direction: column;
  row-gap: 32px;
  width: 100%;
}

.check-confirm-popup__description {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: var(--color-dark-gray);
  text-align: center;
}

.check-confirm-popup__buttons {
  display: flex;
  gap: 12px;
}

.check-confirm-popup__button {
  flex: 1 1 0;
}
</style>
