interface PositionParams {
  reference: HTMLElement
  element: HTMLElement
  placement?: 'top' | 'bottom' | 'right' | 'left'
  offset?: number
  align?: 'left' | 'center' | 'right'
  offsetShift?: number
}

export function getPosition() {
  const OFFSET = 8

  const isFullyInViewPort = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    return rect.top >= 0
      && rect.left >= 0
      && rect.right <= window.innerWidth
      && rect.bottom <= window.innerHeight
  }

  const position = ({
    reference,
    element,
    placement = 'bottom',
    offset = OFFSET,
    align = 'right',
    offsetShift = 0
  }: PositionParams) => {
    const rectRef = reference.getBoundingClientRect()
    const rectEl = element.getBoundingClientRect()
    const elWidth = rectEl.width
    const elHeight = rectEl.height

    let top: number, left: number

    switch (placement) {
      case 'top':
        top = rectRef.top - elHeight - offset
        if (align === 'right') left = rectRef.right - elWidth
        else if (align === 'center') left = rectRef.left + rectRef.width / 2 - elWidth / 2
        else left = rectRef.left
        break
      case 'bottom':
        top = rectRef.bottom + offset
        if (align === 'right') left = rectRef.right - elWidth + offsetShift
        else if (align === 'center') left = rectRef.left + rectRef.width / 2 - elWidth / 2 + offsetShift
        else left = rectRef.left + offsetShift
        break
      case 'left':
        top = rectRef.top + rectRef.height / 2 - elHeight / 2
        left = rectRef.left - elWidth - offset + offsetShift
        break
      case 'right':
        top = rectRef.top + rectRef.height / 2 - elHeight / 2
        left = rectRef.right + offset + offsetShift
        break
    }

    element.style.top = `${top}px`
    element.style.left = `${left}px`
  }

  const autoPosition = (params: PositionParams) => {
    const placements: ('top' | 'bottom' | 'left' | 'right')[] = ['bottom', 'top', 'right', 'left']

    for (const placement of placements) {
      position({ ...params, placement })
      if (isFullyInViewPort(params.element)) return placement
    }
    return position(params)
  }

  return { position, autoPosition, isFullyInViewPort }
}
