<template>
  <div
    v-if="isVisible"
    :class="wrapperClasses"
    @click.self="handleOutsideClick"
  >
    <div
      :class="popupClasses"
      :style="popupStyles"
    >
      <SmoothHeightTransition>
        <template v-if="isLoadingResolved">
          <BaseLoading :size="40" />
        </template>

        <nuxt-icon
          v-if="showCloseIcon && (isLoadingResolved || !props.hasHeader)"
          name="cross"
          class="base-popup__close-btn base-popup__close-btn--absolute"
          @click="handleClose"
        />

        <template v-if="!isLoadingResolved">
          <div
            v-if="props.hasHeader"
            ref="headerElement"
            :class="['base-popup__header', { 'base-popup__header--fixed': props.fixedHeader }]"
          >
            <slot name="header">
              <div class="base-popup__header-content">
                <slot name="title">
                  <div class="base-popup--title">
                    {{ title }}
                  </div>
                </slot>
                <nuxt-icon
                  v-if="showCloseIcon"
                  name="cross"
                  class="base-popup__close-btn"
                  @click="handleClose"
                />
              </div>
            </slot>
          </div>

          <div
            ref="contentElement"
            class="base-popup__content"
          >
            <slot name="content" />
          </div>

          <div
            v-if="hasFooterSlot"
            ref="footerElement"
            :class="['base-popup__footer', { 'base-popup__footer--fixed': props.fixedFooter }]"
          >
            <slot name="footer" />
          </div>
        </template>
      </SmoothHeightTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'
import SmoothHeightTransition from '~/components/common/popups/SmoothHeightTransition.vue'
import BaseLoading from '~/components/common/BaseLoading.vue'
import { closePopup, getActivePopup, getIsLoading } from '~/globalStores/popupStore/popupStore'
import type { PopupType } from '~/globalStores/popupStore/types'
import { usePerfectScrollbar as usePerfectScrollbarComposable } from '~/composables/usePerfectScrollbar'
import { ScreenSize } from '~/utils/screenSize'

const emit = defineEmits(['close'])

const props = withDefaults(
  defineProps<{
    popupId?: PopupType
    width?: string | number
    className?: string
    isMobileType?: boolean
    showIconCross?: boolean
    isLoading?: boolean
    hasHeader?: boolean
    fixedHeader?: boolean
    hasFooter?: boolean
    fixedFooter?: boolean
    customPopupClass?: string
    withoutCloseBtn?: boolean
    disableClickOutside?: boolean
    darkMode?: boolean
    usePerfectScrollbar?: boolean
    title?: string | null
  }>(),
  {
    width: undefined,
    className: undefined,
    isMobileType: false,
    showIconCross: true,
    isLoading: undefined,
    hasHeader: true,
    fixedHeader: false,
    hasFooter: false,
    fixedFooter: false,
    customPopupClass: '',
    withoutCloseBtn: false,
    disableClickOutside: false,
    darkMode: false,
    usePerfectScrollbar: true,
    title: null
  }
)

const slots = useSlots()
const hasFooterSlot = computed(() => Boolean(slots.footer))

const isDesktop = ref(true)

function handleResize() {
  isDesktop.value = window.innerWidth >= ScreenSize.MD
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', handleResize)
  }
})

const isVisible = computed(() => {
  if (!props.popupId) return true
  return getActivePopup.value.popupId === props.popupId
})

const isLoadingResolved = computed(() => props.isLoading ?? getIsLoading.value)

const wrapperClasses = computed(() => [
  'base-popup-wrap',
  props.customPopupClass,
  props.className,
  { 'base-popup-wrap--mobile': props.isMobileType }
])

const popupClasses = computed(() => [
  'base-popup',
  {
    'base-popup--loading': isLoadingResolved.value,
    'base-popup--dark': props.darkMode
  }
])

const popupStyles = computed(() => {
  if (!isDesktop.value) return undefined
  if (props.width === undefined) return undefined
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width
  }
})

const showCloseIcon = computed(() => props.showIconCross && !props.withoutCloseBtn)

const headerElement = ref<HTMLElement | null>(null)
const footerElement = ref<HTMLElement | null>(null)
const contentElement = ref<HTMLElement | null>(null)

const isContentVisible = computed(() => isVisible.value && !isLoadingResolved.value)
if (props.usePerfectScrollbar) {
  usePerfectScrollbarComposable(contentElement, isContentVisible)
}

function handleClose() {
  closePopup()
  emit('close')
}

function closeModal() {
  handleClose()
}

function closePopupEvent() {
  handleClose()
}

function handleOutsideClick() {
  if (props.disableClickOutside) return
  handleClose()
}

defineExpose({
  handleClose,
  closeModal,
  closePopupEvent,
  contentElement,
  headerElement,
  footerElement
})
</script>

<style scoped>
.base-popup-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999999;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}

@media (min-width: 768px) {
  .base-popup-wrap {
    align-items: center;
    padding: 40px 0;
  }
}

.base-popup {
  position: relative;
  background-color: #ffffff;
  min-height: 180px;
  width: 100%;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
}

.base-popup--dark {
  background-color: #2b2e36;
}

.base-popup--dark .base-popup__header--fixed {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #2b2e36 !important;
  color: #ffffff;
}

.base-popup--dark .base-popup--title {
  background-color: #2b2e36 !important;
  color: #ffffff;
}

@media (min-width: 768px) {
  .base-popup {
    min-height: 320px;
    width: auto;
    min-width: 320px;
    max-width: 768px;
    border-radius: 20px;
  }
}

.base-popup--title {
  color: rgba(0, 0, 0, 0.12);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.5rem;
}

.base-popup--loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.base-popup__close-btn {
  cursor: pointer;
  flex-shrink: 0;
  margin-left: auto;
  display: block;
  align-self: flex-start;
}

.base-popup :deep(.base-popup__close-btn svg) {
  width: 24px;
  height: 24px;
  color: var(--secondary-container-fg);
}

.base-popup__close-btn--absolute {
  position: absolute;
  z-index: 99999;
  top: 16px;
  right: 16px;
}

@media (min-width: 768px) {
  .base-popup__close-btn--absolute {
    top: 24px;
    right: 24px;
  }
}

.base-popup__header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent;
  flex-shrink: 0;
  min-height: 64px;
  border-radius: 8px 8px 0 0;
}

@media (min-width: 768px) {
  .base-popup__header {
    padding: 32px;
  }
}

.base-popup__header--fixed {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 10;
}

.base-popup__header-content {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.base-popup__content {
  padding: 16px;
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  position: relative;
}

@media (min-width: 768px) {
  .base-popup__content {
    padding: 32px;
  }
}

.base-popup__footer {
  border-top: 1px solid transparent;
  flex-shrink: 0;
  border-radius: 0 0 8px 8px;
}

.base-popup__footer--fixed {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 0;
  background-color: #ffffff;
  z-index: 10;
}

.base-popup .base-popup__close-btn {
  pointer-events: auto !important;
}
</style>
