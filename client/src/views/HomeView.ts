import { html, state } from 'solit-html'
import {
  logout,
  searchQuery,
  setSearchQuery,
  updateDocument,
  useDocuments,
  type Document,
} from '../dataService'
import { repeat } from 'lit-html/directives/repeat.js'
import { relativeTimeFromNow, withEventValue } from '../utils'
import { nothing } from 'lit-html'

export function HomeView() {
  const documents = useDocuments()
  // The CSS approach for this just was not working...
  const [searchFocused, setSearchFocused] = state(false)
  return html`
    <ion-header>
      <ion-toolbar>
        <ion-searchbar
          animated
          .value=${searchQuery}
          show-cancel-button="focus"
          @ionInput=${withEventValue(setSearchQuery)}
          @ionFocus=${() => setSearchFocused(true)}
          @ionBlur=${() => setSearchFocused(false)}
        ></ion-searchbar>
        ${() =>
          !searchFocused() &&
          html`<ion-buttons slot="end">
            <!-- <ion-button aria-label="filter" href="filter" color="primary">
              <ion-icon name="filter-outline" slot="icon-only"></ion-icon>
            </ion-button> -->
            ${UserMenu()}
          </ion-buttons>`}
      </ion-toolbar>
    </ion-header>
    <ion-content fixed-slot-placement="before">
      <ion-list>
        ${() => {
          const docs = documents()
          if (!docs) {
            return html`<ion-item><ion-spinner></ion-spinner></ion-item>`
          }
          if (searchQuery() && !docs.length) {
            return html`<ion-item>
              No documents found for "${searchQuery()}".
            </ion-item>`
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
  const noteContent = () => {
    const search = searchQuery()
    // Display a snippet of the content if it's a search result, highlighting the search term
    if (search) {
      const notesStart = doc.content.toLowerCase().indexOf(search.toLowerCase())
      if (notesStart === -1) return nothing

      const notesEnd = notesStart + search.length
      const snippetEnd = notesEnd + 100
      return html`<p>
        ${!!notesStart && '...'}
        <mark>${doc.content.slice(notesStart, notesEnd)}</mark
        >${doc.content.slice(notesEnd, snippetEnd)}
        ${snippetEnd < doc.content.length && '...'}
      </p>`
    }
    // If it's not a search result, display the relative update time for shared documents
    if (isShared) {
      return html`<p>Updated ${relativeTimeFromNow(doc.updated)}</p>`
    }
    return nothing
  }

  return html`
    <ion-item button href=${doc.id}>
      ${doc.isTask &&
      html`<ion-checkbox
        slot="start"
        aria-label="Toggle task completion"
        .checked=${!!doc.completed}
        @click=${(e: Event) => e.stopImmediatePropagation()}
        @ionChange=${async (e: Event) => {
          const checked = (e.target as HTMLIonCheckboxElement).checked
          updateDocument(doc.id, {
            completed: checked ? new Date().toISOString() : '',
          })
        }}
      ></ion-checkbox>`}
      <ion-label> ${doc.title} ${noteContent} </ion-label>
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
