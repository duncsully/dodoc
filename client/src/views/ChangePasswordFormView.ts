import { html, state } from 'solit-html'
import { navigate, showToast, withEventValue } from '../utils'
import { updateUser } from '../dataService'

export function ChangePasswordFormView() {
  const [currentPassword, setCurrentPassword] = state('')
  const [newPassword, setNewPassword] = state('')

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>Change Password</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form
        @submit=${async (e: SubmitEvent) => {
          e.preventDefault()
          try {
            await updateUser({
              oldPassword: currentPassword(),
              password: newPassword(),
              passwordConfirm: newPassword(),
            })
            navigate('/profile')
            showToast('Password changed successfully', 'success')
          } catch (error) {
            showToast(
              'Failed to change password: ' + (error as Error).message,
              'danger'
            )
          }
        }}
      >
        <ion-item>
          <ion-input
            label="Current Password"
            label-placement="floating"
            type="password"
            required
            .value=${currentPassword}
            @ionInput=${withEventValue(setCurrentPassword)}
          >
            <ion-input-password-toggle slot="end"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="New Password"
            label-placement="floating"
            type="password"
            required
            .value=${newPassword}
            @ionInput=${withEventValue(setNewPassword)}
          >
            <ion-input-password-toggle slot="end"></ion-input-password-toggle>
          </ion-input>
        </ion-item>
        <ion-button
          expand="full"
          type="submit"
          .disabled=${() => !currentPassword() || !newPassword()}
          class="ion-margin-top"
        >
          Change Password
        </ion-button>
      </form>
    </ion-content>
  `
}
