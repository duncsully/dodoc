import { html } from 'solit-html'
import {
  logout,
  searchQuery,
  setSearchQuery,
  useDocuments,
  type Document,
} from '../dataService'
import { repeat } from 'lit-html/directives/repeat.js'
import { relativeTimeFromNow, withEventValue } from '../utils'

export function HomeView() {
  const documents = useDocuments()
  return html`
    <ion-header>
      <ion-toolbar>
        <ion-searchbar
          animated
          .value=${searchQuery}
          @ionInput=${withEventValue(setSearchQuery)}
        ></ion-searchbar>
        <ion-buttons slot="end">${UserMenu()}</ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content fixed-slot-placement="before">
      <ion-list>
        ${() => {
          const docs = documents()
          if (!docs) {
            return html`<ion-item><ion-spinner></ion-spinner></ion-item>`
          }
          if (docs.length === 0) {
            return html`<ion-item>
              No documents yet. Click the + button to add one.
            </ion-item>`
          }
          return repeat(docs, (doc) => doc.id, DocumentItem)
        }}
      </ion-list>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button aria-label="Add Document" href="/new">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
}

function DocumentItem(doc: Document) {
  const isShared = !!doc.shared.length
  return html`
    <ion-item button href=${doc.id}>
      <ion-label>
        ${doc.title}
        ${isShared && html`<p>Updated ${relativeTimeFromNow(doc.updated)}</p>`}
      </ion-label>
    </ion-item>
  `
}

function UserMenu() {
  return html`<ion-button aria-label="User menu" id="user-menu" color="primary">
      <ion-icon name="person-circle-outline" slot="icon-only"></ion-icon>
    </ion-button>
    <ion-popover
      trigger="user-menu"
      side="bottom"
      alignment="end"
      dismiss-on-select
    >
      <ion-list>
        <ion-item button href="/profile">
          <ion-icon
            slot="start"
            name="person-outline"
            color="primary"
          ></ion-icon>
          Profile
        </ion-item>
        <ion-item button @click=${logout}>
          <ion-icon
            slot="start"
            name="log-out-outline"
            color="primary"
          ></ion-icon>
          Logout
        </ion-item>
      </ion-list>
    </ion-popover>`
}
