import PerfectScrollbar from 'perfect-scrollbar'

export function usePerfectScrollbar(element: Ref<HTMLElement | null>, options: object = {
  wheelSpeed: 2,
  wheelPropagation: false,
  minScrollbarLength: 8,
  scrollXMarginOffset: 10
}) {
  let resizeHandler: ResizeObserver | null = null
  let ps: PerfectScrollbar | null = null
  let mutationHandler: MutationObserver | null = null

  onMounted(() => {
    if (!element.value) return

    ps = new PerfectScrollbar(element.value, { ...options })

    resizeHandler = new ResizeObserver(() => {
      if (ps) {
        ps.update()
      }
    })

    mutationHandler = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            resizeHandler?.observe(node)
          }
        })
      }
    })

    mutationHandler.observe(element.value, { childList: true, subtree: true })

    for (const child of element.value.children) {
      resizeHandler.observe(child)
    }
  })

  onBeforeUnmount(() => {
    resizeHandler?.disconnect()
    ps?.destroy()
  })
}
