import { html } from 'solit-html'
import { myUser, useDocument } from '../dataService'
import { MarkdownDisplay } from '../components/MarkdownDisplay'
import { DeleteDocumentItem } from '../components/DeleteDocumentItem'

export function DocumentView({ id }: { id: () => string }) {
  const doc = useDocument(id)

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>${() => doc()?.title ?? 'Loading...'}</ion-title>
        <ion-buttons slot="end">
          <ion-button id="doc-more-options" color="primary">
            <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
          </ion-button>
          <ion-popover
            trigger="doc-more-options"
            alignment="end"
            dismiss-on-select
          >
            <ion-list>
              <ion-item button href=${() => `/${id()}/edit`}>
                <ion-icon slot="start" name="create-outline"></ion-icon>
                <ion-label>Edit Document</ion-label>
              </ion-item>
              ${doc()?.owner === myUser()?.id && DeleteDocumentItem(id)}
            </ion-list>
          </ion-popover>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      ${MarkdownDisplay(() => doc()?.content ?? '')}
    </ion-content>
  `
}
