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

<style scoped>

</style>
