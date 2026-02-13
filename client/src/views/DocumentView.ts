import { html } from 'solit-html'
import { useDocument } from '../dataService'
import { MarkdownDisplay } from '../components/MarkdownDisplay'
import { DocumentOptionsButton } from '../components/DocumentOptionsButton'

export function DocumentView({ id }: { id: () => string }) {
  const doc = useDocument(id)

  return html`${() => {
    const document = doc()
    if (!document)
      return html`<ion-content class="ion-padding">
        <p>Document not found.</p>
        <ion-router-link href="/" direction="home"
          >Go back home</ion-router-link
        >
      </ion-content>`

    return html`
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
          </ion-buttons>
          <ion-title>${() => document.title}</ion-title>
          <ion-buttons slot="end">
            ${() => DocumentOptionsButton({ id, showEdit: true })}
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        ${MarkdownDisplay(() => document.content)}
      </ion-content>
    `
  }}`
}
