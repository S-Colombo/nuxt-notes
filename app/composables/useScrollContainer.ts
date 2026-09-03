// для отслеживания скролла на странице, т.к. p.s. превентит и document. и windows.addEventListener('scroll')
export const useScrollContainer = (selector = 'main.content') => {
  const container = ref<HTMLElement | null>(null)
  onMounted(() => {
    container.value = document.querySelector(selector) as HTMLElement | null
  })
  return {
    container: computed(() => container.value)
  }
}
