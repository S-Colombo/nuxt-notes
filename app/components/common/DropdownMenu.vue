<template>
  <div
    class="dropdown-menu"
    @click.stop
  >
    <button
      ref="triggerRef"
      class="dropdown-menu__button"
      :aria-expanded="isActive"
      aria-haspopup="menu"
      :popovertarget="id"
      :aria-label="ariaLabel"
      @click="isActive = true"
    >
      <nuxt-icon
        class="dropdown-menu__button-icon"
        :name="icon"
      />
    </button>
    <div
      :id="id"
      ref="menuContainer"
      popover
      :class="['dropdown-menu__list-container', { active: isActive }]"
    >
      <div
        ref="menuContent"
        class="dropdown-menu__list-content"
      >
        <div
          ref="dropScrollContainer"
          class="dropdown-menu__list-scroll"
          :style="{ maxHeight: maxHeight ? maxHeight + 'px' : 'auto' }"
        >
          <slot />
          <div
            v-if="!$slots.default && menuItems.length"
            class="dropdown-menu__items"
          >
            <button
              v-for="(item, index) in menuItems"
              :key="index"
              class="dropdown-menu__item"
              :class="item.class ? item.class : null"
              @click="itemClick(item)"
            >
              <nuxt-icon
                v-if="item.icon"
                :name="item.icon"
                class="dropdown-menu__item-icon"
              />
              <span>{{ item.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePerfectScrollbar, useScrollContainer } from '#imports'
import { getPosition } from '~/services/utils/helpers'

interface MenuItem {
  label: string
  icon?: string
  value: string
  class?: string
}

const props = withDefaults(defineProps<{
  menuItems?: Array<{
    label: string
    icon?: string
    value: string
    class?: string
  }>
  maxHeight?: number
  icon?: string | undefined
  ariaLabel?: string
}>(), {
  menuItems: () => [],
  icon: 'more',
  ariaLabel: 'Меню действий'
})

const emit = defineEmits<{
  value: [value: string]
}>()

const id = useId()
const { container } = useScrollContainer('main.content')
const isActive = ref(false)
const menuContent = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuContainer = ref<HTMLElement | null>(null)
const dropScrollContainer = ref<HTMLElement | null>(null)
let scrollTimeout: NodeJS.Timeout

if (props.maxHeight) {
  usePerfectScrollbar(dropScrollContainer)
}

onMounted(() => {
  if (container.value) {
    container.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('scroll', handleScroll)
  }
})

function handleScroll() {
  if (!isActive.value) return
  if (scrollTimeout) clearTimeout(scrollTimeout)

  scrollTimeout = setTimeout(() => {
    if (menuContainer.value) menuContainer.value.hidePopover()
    isActive.value = false
  }, 150)
}

function itemClick(item: MenuItem) {
  emit('value', item.value)
  if (menuContainer.value) menuContainer.value.hidePopover()
  isActive.value = false
}

watch(isActive, (active) => {
  if (active && triggerRef.value && menuContainer.value) {
    const { autoPosition } = getPosition()
    setTimeout(() => {
      autoPosition({
        reference: triggerRef.value!,
        element: menuContainer.value!,
        placement: 'bottom',
        align: 'right',
        offsetShift: 8
      })
    }, 20) // Ждём анимацию CSS (20ms) - для случая, если дропдаун внизу страницы
  }
})
</script>

<style scoped>
.dropdown-menu {
  width: fit-content;
  position: relative;
}

.dropdown-menu__button {
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dropdown-menu__button:hover {
  background-color: var(--bg-level);
}

.dropdown-menu__button-icon {
  color: var(--fg-muted);
}

.dropdown-menu__button-icon:hover {
  color: var(--secondary-container-fg);
}

.dropdown-menu__list-container {
  position: fixed;
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 8px 24px 0 var(--black-10);
  z-index: 1000;
  min-width: 160px;
  transition: display 0.2s, opacity 0.2s;
  transition-behavior: allow-discrete;
  opacity: 0;
}

.dropdown-menu__list-container:popover-open {
  opacity: 1;
}

@starting-style {
  .dropdown-menu__list-container:popover-open {
    opacity: 0;
  }
}

.dropdown-menu__list-content {
  padding: 8px;
}

.dropdown-menu__items {
  display: flex;
  flex-direction: column;
}

.dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 12px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.1s linear;
  border-radius: 8px;
}

.dropdown-menu__item:hover {
  background-color: var(--grey-100);
}

.dropdown-menu__item-icon {
  width: 24px;
  height: 24px;
}
</style>
