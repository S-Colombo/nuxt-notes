<template>
  <button
    :class="[`button ${variant}`]"
    :type="btnType"
    :disabled="disabled || isLoading"
  >
    <NuxtIcon
      v-if="isLoading && !disabledLoading"
      class="w-5 h-5 mr-1"
      name="loading"
      filled
    />
    <NuxtIcon
      v-if="icon"
      :name="icon"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  btnType?: 'submit' | 'button' | 'reset'
  variant?: 'default' | 'soft'
  label?: string
  color?: string | undefined
  icon?: string | undefined
  trailingIcon?: string | undefined
  avatar?: string | undefined
  link?: string | undefined
  loading?: boolean
  disabled?: boolean
  disabledLoading?: boolean
}>(), {
  btnType: 'button',
  variant: 'default',
  label: '',
  color: undefined,
  icon: undefined,
  trailingIcon: undefined,
  avatar: undefined,
  link: undefined,
  loading: false,
  disabled: false
})

const formLoading = inject <Ref<boolean>>('formLoading', ref(false))
const isLoading = computed(() => formLoading.value || props.loading)
</script>

<style scoped lang="scss">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--color-black);
  border-radius: 8px;
  background: var(--color-black);
  color: var(--color-white-light);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-black-hover);
    border-color: var(--color-black-hover);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.soft {
    background: transparent;
    color: var(--color-black);

    &:hover:not(:disabled) {
      background: var(--color-gray);
      border-color: var(--color-black);
      color: var(--color-black);
    }
  }
}
</style>
