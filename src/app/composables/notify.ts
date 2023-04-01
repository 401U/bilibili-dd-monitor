import { notify } from '@kyvg/vue3-notification'

export function actionNotify(type?: string, text?: string) {
  notify({
    group: 'action-feedback',
    // position: 'top', TODO
    duration: 1500,
    type,
    text,
  })
}
