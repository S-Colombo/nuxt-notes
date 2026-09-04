export interface PopupStore {
  activePopup: {
    popupId: PopupType | null
    params?: PopupParams[PopupType] | null
  }
  popupQueue: { popupId: PopupType, params?: PopupParams[PopupType] }[]
  isLoading: boolean
  response?: Record<string, string> | null
}

export enum PopupType {
  CheckConfirmPopup = 'CheckConfirmPopup',
}

export type ConfirmAction = 'deleteNote' | 'cancelEdit'

export type PopupParams = {
  [PopupType.CheckConfirmPopup]: {
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    action: ConfirmAction
    noteId?: string
  }
}
