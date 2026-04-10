import { repeat } from 'lit-html/directives/repeat.js'
import { html } from 'solit-html'
import { searchQuery, updateDocument, type Document } from '../dataService'
import { nothing } from 'lit-html'
import { relativeTimeFromNow } from '../utils'

export function DocumentList({
  documents,
  emptyContent,
}: {
  documents: () => Document[] | null
  emptyContent: () => string
}) {
  return html`
    <ion-list>
      ${() => {
        const docs = documents()
        if (!docs) {
          return html`<ion-item><ion-spinner></ion-spinner></ion-item>`
        }
        if (!docs.length) {
          return html`<ion-item>${emptyContent}</ion-item>`
        }

        return repeat(docs, (doc) => doc.id, DocumentItem)
      }}
    </ion-list>
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
