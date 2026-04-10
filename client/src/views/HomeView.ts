import { html, state } from 'solit-html'
import {
  logout,
  searchQuery,
  setSearchQuery,
  useDocuments,
} from '../dataService'
import { withEventValue } from '../utils'
import { DocumentList } from '../components/DocumentList'

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
      ${DocumentList({
        documents,
        emptyContent: () =>
          searchQuery().length
            ? `No documents found for "${searchQuery()}"`
            : 'No documents yet. Click the + button to add one.',
      })}
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button aria-label="Add Document" href="/new">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
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
