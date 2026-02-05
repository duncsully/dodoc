import { html, state } from 'solit-html'
import {
  createDocument,
  deleteDocument,
  updateDocument,
  useDocument,
  useMe,
  useUsers,
} from '../dataService'
import { navigate, showAlert, showToast, withEventValue } from '../utils'
import { until } from 'lit-html/directives/until.js'
import type { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core'
import { MarkdownDisplay } from '../components/MarkdownDisplay'

export function DocumentFormView({ id }: { id?: (track?: boolean) => string }) {
  const doc = id?.(false) ? useDocument(id) : null

  const [title, setTitle] = state(doc?.()?.title ?? '')
  const [shared, setShared] = state<string[]>(doc?.()?.shared ?? [])
  const [content, setContent] = state(doc?.()?.content ?? '')
  const invalid = () => !title().trim().length

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (invalid()) return
    const data = { title: title(), content: content(), shared: shared() }

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

  const handleDelete = async () => {
    if (!id?.()) return
    showAlert('Are you sure you want to delete this document?', {
      header: 'Delete Document',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteDocument(id())
              navigate('/', 'root')
            } catch (err) {
              showToast('Failed to delete document: ' + (err as Error).message)
            }
          },
        },
      ],
    })
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
        <ion-buttons slot="end">
          ${() =>
            doc &&
            doc?.()?.owner === useMe()?.id &&
            html`
              <ion-button
                aria-label="Delete Document"
                @click=${handleDelete}
                color="danger"
              >
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            `}
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form
        @submit=${handleSubmit}
        class="ion-display-flex ion-flex-column"
        style="gap: 16px;"
      >
        <ion-input
          label="Title"
          label-placement="floating"
          type="text"
          .value=${title}
          @ionInput=${withEventValue(setTitle)}
          required
          fill="outline"
        ></ion-input>

        <ion-select
          label="Share with"
          label-placement="floating"
          multiple
          .value=${shared}
          @ionChange=${(e: IonSelectCustomEvent<SelectChangeEventDetail>) =>
            setShared(e.detail.value)}
          fill="outline"
          helper-text="Selected users will be able to view and edit this document."
        >
          ${until(
            useUsers().then((users) => {
              if (users.length === 0) {
                return html`<ion-select-option disabled>
                  No users available
                </ion-select-option>`
              }
              return users.map(
                (user) => html`
                  <ion-select-option value=${user.id}>
                    ${user.name || user.email}
                  </ion-select-option>
                `
              )
            }),
            html`<ion-select-option disabled>
              Loading users...
            </ion-select-option>`
          )}
        </ion-select>

        <!-- TODO: The M3 overrides messes with the segment button styles -->
        <ion-segment color="tertiary">
          <ion-segment-button value="editor" content-id="editor">
            <ion-label>Editor</ion-label>
          </ion-segment-button>
          <ion-segment-button value="preview" content-id="preview">
            <ion-label>Preview</ion-label>
          </ion-segment-button>
        </ion-segment>
        <ion-segment-view>
          <ion-segment-content id="editor" class="ion-padding-top">
            <ion-textarea
              label="Content"
              label-placement="floating"
              auto-grow
              min-rows="5"
              .value=${content}
              @ionInput=${withEventValue(setContent)}
              fill="outline"
              helper-text="Markdown supported"
            ></ion-textarea>
          </ion-segment-content>
          <ion-segment-content id="preview" class="ion-padding-top">
            ${MarkdownDisplay(content)}
          </ion-segment-content>
        </ion-segment-view>
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
