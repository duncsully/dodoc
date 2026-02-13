import { html } from 'solit-html'
import { myUser, useDocument } from '../dataService'
import { DeleteDocumentItem } from './DeleteDocumentItem'

export function DocumentOptionsButton({
  id,
  showEdit,
}: {
  id: () => string
  showEdit?: boolean
}) {
  const doc = useDocument(id)

  // Dynamic ID ensures popover displays correctly for detail and edit views
  const buttonId = () => `doc-options-${id()}-${showEdit ? 'edit' : ''}`

  return html`<ion-button id=${buttonId} color="primary">
      <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
    </ion-button>
    <ion-popover trigger=${buttonId} alignment="end" dismiss-on-select>
      <ion-list>
        ${showEdit &&
        html`
          <ion-item button href=${() => `/${id()}/edit`}>
            <ion-icon slot="start" name="create-outline"></ion-icon>
            <ion-label>Edit</ion-label>
          </ion-item>
        `}
        <ion-item button href=${() => `/new?copy="${id()}"`}>
          <ion-icon slot="start" name="copy-outline"></ion-icon>
          <ion-label>Copy</ion-label>
        </ion-item>
        ${doc()?.owner === myUser()?.id && DeleteDocumentItem(id)}
      </ion-list>
    </ion-popover>`
}
