import { html } from 'solit-html'
import { deleteDocument, useDocument } from '../dataService'
import { MarkdownDisplay } from '../components/MarkdownDisplay'
import { navigate, showAlert, showToast } from '../utils'

export function DocumentView({ id }: { id: () => string }) {
  const doc = useDocument(id)
  const handleDelete = async () => {
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
            } catch (err) {
              showToast('Failed to delete document: ' + (err as Error).message)
            }
          },
        },
      ],
    })
  }
  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>${() => doc()?.title ?? 'Loading...'}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            aria-label="Delete Document"
            @click=${handleDelete}
            color="danger"
          >
            <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      ${() => MarkdownDisplay(doc()?.content ?? '')}
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button
          aria-label="Edit Document"
          href=${() => `/${id()}/edit`}
        >
          <ion-icon name="create-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
}
