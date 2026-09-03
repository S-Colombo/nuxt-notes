import type { PopupParams, PopupStore, PopupType } from './types'

const state = ref<PopupStore>({
  activePopup: { popupId: null, params: null },
  popupQueue: [],
  isLoading: false,
  response: null
})

export const getActivePopup = computed<{ popupId: PopupType | null, params?: PopupParams[PopupType] | null }>(
  () => state.value.activePopup
)

export const getIsLoading = computed(() => state.value.isLoading)

export const setActivePopup = (popupId: PopupType | null, params?: PopupParams[PopupType]) => {
  state.value.activePopup = { popupId, params: params || null }
}

export const setIsLoading = (value: boolean) => {
  state.value.isLoading = value
}

export const showPopup = (popupId: PopupType, params?: PopupParams[PopupType]) => {
  if (popupId === state.value.activePopup.popupId) {
    return
  }
  if (!state.value.activePopup.popupId) {
    setActivePopup(popupId, params)
  } else {
    state.value.popupQueue.push({ popupId, params })
  }
}

export const showPopupHard = (popupId: PopupType, params?: PopupParams[PopupType]) => {
  // Открываем попап вне очереди заменяя текущий активный
  // Не добавляем в popupQueue ничего
  // Поскольку текущий открытый попап не находится в popupQueue, то мы не нуждаемся popupQueue.value.shift()
  // В итоге мы никак не изменяем popupQueue и если в очереди поппапов есть модалки, то они там и останутся
  setActivePopup(popupId, params)
}

export const closePopup = () => {
  state.value.popupQueue.shift()
  setActivePopup(null)
  if (state.value.popupQueue.length > 0) {
    const next = state.value.popupQueue.shift()
    if (next) {
      setActivePopup(next.popupId, next.params)
    }
  }
}
const closeSpecificPopup = (popupId: PopupType) => {
  // альтернатива private setVisible
  state.value.popupQueue = state.value.popupQueue.filter(popup => popup.popupId !== popupId)
  if (state.value.activePopup.popupId === popupId) {
    closePopup()
  }
}
export const closeAllPopup = (current?: PopupType) => {
  // альтернатива public static closeAll
  state.value.popupQueue.forEach((popup) => {
    if (popup.popupId != current) {
      closeSpecificPopup(popup.popupId)
    }
  })
}

export const getResponse = computed(() => state.value.response)

// Функция для очистки ответа
export const clearResponse = () => {
  state.value.response = null
}

export const setResponse = (response: Record<string, string>) => {
  state.value.response = response
}
