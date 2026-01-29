import { html, state } from 'solit-html'
import { createDocument, updateDocument, useDocument } from '../dataService'
import { navigate, showToast, withEventValue } from '../utils'

export function DocumentFormView({ id }: { id?: (track?: boolean) => string }) {
  const doc = id?.(false) ? useDocument(id) : null

  const [title, setTitle] = state(doc?.()?.title ?? '')
  const [content, setContent] = state(doc?.()?.content ?? '')
  const invalid = () => !title().trim().length

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (invalid()) return
    const data = { title: title(), content: content() }

    try {
      if (doc?.()?.id) {
        await updateDocument(doc()!.id, data)
        navigate(`/${doc()!.id}`, 'back')
        return
      }
      const newDoc = await createDocument(data)
      navigate(`../${newDoc.id}`)
    } catch (err) {
      showToast('Failed to save document: ' + (err as Error).message)
    }
  }

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            default-href=${() => (id ? `/${id()}` : '/')}
            icon="close"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>${() => (doc ? 'Edit Document' : 'New Document')}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit=${handleSubmit}>
        <ion-item>
          <ion-input
            label="Title"
            label-placement="floating"
            type="text"
            .value=${title}
            @ionInput=${withEventValue(setTitle)}
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-textarea
            label="Content"
            label-placement="floating"
            auto-grow
            min-rows="5"
            .value=${content}
            @ionInput=${withEventValue(setContent)}
          ></ion-textarea>
        </ion-item>
      </form>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button
          aria-label="Save Document"
          type="submit"
          @click=${handleSubmit}
          ?disabled=${invalid}
        >
          <ion-icon name="save"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
}
