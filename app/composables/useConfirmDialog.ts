import {
  clearResponse,
  closePopup,
  getActivePopup,
  getResponse,
  showPopup,
} from '~/globalStores/popupStore/popupStore'
import { PopupType, type ConfirmAction } from '~/globalStores/popupStore/types'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  action: ConfirmAction
  noteId?: string
}

/**
 * Opens CheckConfirmPopup and resolves when the user confirms or dismisses.
 */
export function useConfirmDialog() {
  async function confirm(options: ConfirmOptions): Promise<boolean> {
    clearResponse()
    showPopup(PopupType.CheckConfirmPopup, {
      title: options.title,
      description: options.description ?? 'Это действие нельзя отменить',
      confirmLabel: options.confirmLabel ?? 'Подтвердить',
      cancelLabel: options.cancelLabel ?? 'Отменить',
      action: options.action,
      noteId: options.noteId,
    })

    return new Promise((resolve) => {
      let settled = false

      const finish = (value: boolean) => {
        if (settled) return
        settled = true
        stopResponse()
        stopPopup()
        clearResponse()
        resolve(value)
      }

      const stopResponse = watch(getResponse, (response) => {
        if (!response) return
        if (response.confirmed === 'true') {
          finish(true)
        } else if (response.confirmed === 'false') {
          finish(false)
        }
      })

      const stopPopup = watch(getActivePopup, (active, prev) => {
        if (prev?.popupId === PopupType.CheckConfirmPopup && !active.popupId) {
          // Closed via overlay / Esc without an explicit response
          queueMicrotask(() => {
            if (!settled && !getResponse.value) {
              finish(false)
            }
          })
        }
      })
    })
  }

  return { confirm }
}

export { closePopup }
