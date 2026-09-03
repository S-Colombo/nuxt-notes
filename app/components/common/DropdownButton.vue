<template>
  <div class="dropdown">
    <button
      class="dropdown__button button soft"
      :aria-expanded="isActive"
      aria-haspopup="listbox"
      @click="dropdownHandler"
    >
      <div class="flex gap-3 items-center">
        <span class="dropdown__label">{{ model?.label ?? baseLabel }}</span>
        <nuxt-icon
          v-if="icon"
          class="-ml-[2px]"
          :name="icon"
        />
      </div>
    </button>
    <div :class="['dropdown__list-container', { active: isActive }]">
      <div
        ref="dropdownContent"
        class="dropdown__list-content"
      >
        <div
          ref="scrollContainer"
          class="dropdown__list-scroll"
          :style="{ maxHeight: maxHeight ? maxHeight + 'px' : 'auto' }"
        >
          <ul
            class="dropdown__list"
            tabindex="0"
            role="listbox"
            aria-label="Список"
          >
            <template v-if="data.length">
              <li
                v-for="(item, index) in data"
                :key="index"
                :aria-selected="item.label === modelValue?.label"
                role="option"
                class="dropdown__list-item"
                :class="{ select: model === item }"
                @click="model = item; dropdownHandler()"
              >
                <span class="dropdown__label">{{ item.label }}</span>
              </li>
            </template>
            <template v-else>
              <li
                aria-selected="true"
                role="option"
                class="dropdown__list-item"
              >
                <span class="dropdown__label">Нет данных</span>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, usePerfectScrollbar } from '#imports'

const model = defineModel<{ label: string, value: object | string | number } | null>()

const props = withDefaults(defineProps<{
  data: { label: string, value: object | string | number }[]
  maxHeight?: number
  baseLabel?: string
  icon?: string | undefined
}>(), {
  baseLabel: 'Выберите...'
})

const scrollContainer = ref<HTMLElement | null>(null)
if (props.maxHeight) {
  usePerfectScrollbar(scrollContainer)
}

const isActive = ref<boolean>(false)
const dropdownContent = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', clickOutsideHandler)
})

onUnmounted(() => {
  document.removeEventListener('click', clickOutsideHandler)
})

const clickOutsideHandler = (event: Event) => {
  if (!dropdownContent.value || !isActive.value) return

  const children = event.target as Node
  const isOutside = !children.contains(dropdownContent.value)

  if (!isOutside) {
    dropdownHandler()
  }
}

function dropdownHandler() {
  isActive.value = !isActive.value

  setTimeout(() => {
    if (!isActive.value && dropdownContent.value) {
      dropdownContent.value.style.padding = '0'
    }
  }, 200)
  if (isActive.value && dropdownContent.value) {
    dropdownContent.value.style.padding = '8px'
  }
}
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown__button {
  height: 44px;
  padding-right: 12px;
}

.dropdown__label::first-letter {
  text-transform: uppercase;
}

.dropdown__list-container {
  position: absolute;
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 0.2s linear;
  top: calc(100% + 8px);
  left: -8px;
  right: -8px;
  white-space: nowrap;
  height: fit-content;
  min-width: fit-content;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  background-color: var(--bg-surface);
  border-radius: 16px;
  box-shadow: 0 8px 24px 0 var(--black-10);
  z-index: 1;
}

.dropdown__list-container.active {
  grid-template-rows: 1fr;
}

.dropdown__list-content {
  min-height: 0;
}

.dropdown__list-scroll {
  position: relative;
}

.dropdown__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dropdown__list-item {
  display: flex;
  padding: 12px 16px;
  transition: background-color 0.1s linear;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
}

.dropdown__list-item.select,
.dropdown__list-item[aria-selected="true"] {
  background-color:  var(--secondary-container);
  cursor: default;
}

.dropdown__list-item:not(.select, [aria-selected="true"]):hover {
  background-color: var(--grey-100);
}
</style>
