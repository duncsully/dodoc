import { html } from 'solit-html'
import { logout, useDocuments } from '../dataService'
import { repeat } from 'lit-html/directives/repeat.js'

export function HomeView() {
  const documents = useDocuments()
  return html`
    <ion-header>
      <ion-toolbar>
        <ion-title>Dodoc</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Logout" @click=${logout} color="primary">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content fixed-slot-placement="before">
      <ion-list>
        ${() =>
          repeat(
            documents(),
            (doc) => doc.id,
            (doc) => html`
              <ion-item button href=${doc.id}>
                <ion-label>${doc.title}</ion-label>
              </ion-item>
            `
          )}
      </ion-list>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button aria-label="Add Document" href="/new">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
}
