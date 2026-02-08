import { html } from 'solit-html'
import { deleteDocument } from '../dataService'
import { navigate, showAlert, showToast } from '../utils'

export function DeleteDocumentItem(id?: () => string) {
  const handleDelete = async () => {
    if (!id?.()) return
    showAlert('Are you sure you want to delete this document?', {
      header: 'Delete Document',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteDocument(id())
              navigate('/', 'root')
              showToast('Document deleted', 'success')
            } catch (err) {
              showToast(
                'Failed to delete document: ' + (err as Error).message,
                'danger'
              )
            }
          },
        },
      ],
    })
  }
  return html`
    <ion-item button @click=${handleDelete}>
      <ion-icon slot="start" name="trash-outline" color="danger"></ion-icon>
      <ion-label color="danger">Delete</ion-label>
    </ion-item>
  `
}
