import { html } from 'solit-html'
import { useDocument } from '../dataService'
import { MarkdownDisplay } from '../components/MarkdownDisplay'

export function DocumentView({ id }: { id: () => string }) {
  const doc = useDocument(id)

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>${() => doc()?.title ?? 'Loading...'}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      ${MarkdownDisplay(() => doc()?.content ?? '')}
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
