import { html, state } from 'solit-html'
import { myAvatarUrl, myUser, updateUser } from '../dataService'
import { showToast, withEventValue } from '../utils'
import type { IonToggleCustomEvent, ToggleChangeEventDetail } from '@ionic/core'

export function ProfileFormView() {
  const user = myUser()
  const [name, setName] = state(user?.name ?? '')
  const [avatar, setAvatar] = state(undefined as File | undefined)
  const [emailVisibility, setEmailVisibility] = state(
    user?.emailVisibility ?? false
  )
  const avatarPreview = () => {
    const file = avatar()
    if (file) {
      return URL.createObjectURL(file)
    }
    return myAvatarUrl()
  }

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content color="medium">
      <form
        id="profile-form"
        @submit=${async (e: SubmitEvent) => {
          e.preventDefault()
          try {
            await updateUser({
              name: name(),
              emailVisibility: emailVisibility(),
              avatar: avatar(),
            })
            showToast('Profile updated', 'success')
          } catch (error) {
            showToast(
              'Failed to update profile: ' + (error as Error).message,
              'danger'
            )
          }
        }}
      >
        <ion-list inset>
          <ion-item>
            <ion-input
              label="Email"
              label-placement="floating"
              type="email"
              value=${user?.email}
              disabled
            ></ion-input>
          </ion-item>
        </ion-list>
        <ion-note class="ion-padding">
          Updating email and password not currently supported
        </ion-note>
        <ion-list inset>
          <ion-item>
            <ion-input
              name="name"
              label="Name"
              label-placement="floating"
              .value=${name}
              @ionInput=${withEventValue(setName)}
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              name="avatar"
              label="Avatar"
              label-placement="floating"
              type="file"
              accept="image/*"
              @change=${(e: Event) => {
                const input = e.target as HTMLInputElement
                const file = input.files?.[0]
                setAvatar(file)
              }}
            ></ion-input>
            <ion-avatar slot="end" style="border-radius: 50%;">
              <img src=${avatarPreview} />
            </ion-avatar>
          </ion-item>
          <ion-item>
            <ion-toggle
              name="emailVisibility"
              label-placement="start"
              checked=${emailVisibility}
              @ionChange=${(e: IonToggleCustomEvent<ToggleChangeEventDetail>) =>
                setEmailVisibility(e.detail.checked)}
            >
              <ion-label>Make profile public</ion-label>
              <ion-note>Lets other users share documents with you</ion-note>
            </ion-toggle>
          </ion-item>
        </ion-list>
      </form>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button color="primary" type="submit" form="profile-form">
            <ion-icon slot="start" name="save-outline"></ion-icon>
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `
}
