import { html, memo, state, urlState } from 'solit-html'
import {
  createDocument,
  updateDocument,
  useDocument,
  myUser,
  useUsers,
} from '../dataService'
import { navigate, showToast, withEventValue } from '../utils'
import { until } from 'lit-html/directives/until.js'
import type { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core'
import { MarkdownDisplay } from '../components/MarkdownDisplay'
import { DocumentOptionsButton } from '../components/DocumentOptionsButton'

// TODO: The form should be split to accept props for each field, handling state in parent
// and then the parent should handle the create/copy/update logic.
export function DocumentFormView({ id }: { id?: (track?: boolean) => string }) {
  const doc = id?.(false) ? useDocument(id) : null

  // If copyId is present, we're copying an existing document, but treating it as a
  // new document.
  const [copyId] = urlState('copy', '')
  const copyDoc = copyId?.(false) ? useDocument(copyId) : null

  const [title, setTitle] = state(doc?.()?.title ?? copyDoc?.()?.title ?? '')
  const [shared, setShared] = state<string[]>(doc?.()?.shared ?? [])
  const [content, setContent] = state(
    doc?.()?.content ?? copyDoc?.()?.content ?? ''
  )

  const [editingContent, setEditingContent] = state(!id?.(false))
  const invalid = () => !title().trim().length

  const isSharedDoc = memo(
    () => !!doc && doc()?.owner !== myUser()?.id && !copyDoc
  )

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

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            default-href=${() => (id ? `/${id()}` : '/')}
          ></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="end">
          ${() => id?.() && DocumentOptionsButton({ id })}
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content color="medium">
      <form @submit=${handleSubmit}>
        <ion-list inset>
          <ion-item>
            <ion-input
              label="Title"
              label-placement="floating"
              type="text"
              .value=${title}
              @ionInput=${withEventValue(setTitle)}
              required
              disabled=${isSharedDoc}
              helper-text=${() =>
                isSharedDoc()
                  ? `Shared by ${
                      doc?.()?.expand.owner?.name ||
                      doc?.()?.expand.owner?.email
                    }`
                  : undefined}
            >
            </ion-input>
          </ion-item>
        </ion-list>

        <ion-list inset>
          <ion-list-header>
            <ion-label>Content</ion-label>
            <ion-button
              @click=${() => setEditingContent(!editingContent(false))}
            >
              ${() => (editingContent() ? 'Preview' : 'Edit')}
            </ion-button>
          </ion-list-header>
          ${() =>
            editingContent()
              ? html`
                  <ion-item>
                    <ion-textarea
                      auto-grow
                      min-rows="5"
                      .value=${content}
                      @ionInput=${withEventValue(setContent)}
                      spellcheck
                      helper-text="Markdown supported"
                      autofocus
                    ></ion-textarea>
                  </ion-item>
                `
              : html`<div class="ion-padding">
                  ${MarkdownDisplay(content)}
                </div>`}
        </ion-list>
        <ion-list inset>
          <!-- <ion-item>
            <ion-label>Remind me</ion-label>
            <ion-datetime-button datetime="datetime"></ion-datetime-button>
          </ion-item>
          <ion-modal>
            <ion-datetime
              id="datetime"
              color="primary"
              show-adjacent-days
            ></ion-datetime>
          </ion-modal> -->
          <ion-item>
            <ion-select
              label="Collaborators"
              label-placement="floating"
              multiple
              .value=${shared}
              @ionChange=${(e: IonSelectCustomEvent<SelectChangeEventDetail>) =>
                setShared(e.detail.value)}
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
                      <ion-select-option
                        value=${user.id}
                        disabled=${() =>
                          isSharedDoc() && user.id == doc?.()?.owner}
                      >
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
          </ion-item>
        </ion-list>
      </form>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button color="primary" type="submit" @click=${handleSubmit}>
            <ion-icon slot="start" name="save-outline"></ion-icon>
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `
}
