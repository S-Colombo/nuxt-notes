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
  RemoveBonusePopup = 'RemoveBonusePopup',
}
export type PopupParams = {
  [PopupType.RemoveBonusePopup]: {
    title: string
    taskId?: string
  }

}
