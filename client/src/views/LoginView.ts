import { html, state } from 'solit-html'
import { login, signUp } from '../dataService'
import { withEventValue } from '../utils'

export function LoginView() {
  const [showSignup, setShowSignup] = state(false)
  const [email, setEmail] = state('')
  const [password, setPassword] = state('')
  const formDisabled = () => !email().length || !password().length

  return html`
    <ion-card class="ion-margin">
      <ion-card-header>
        <ion-card-title>
          ${() => (showSignup() ? 'Sign Up' : 'Login')}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <form
          @submit=${(e: Event) => {
            e.preventDefault()
            if (formDisabled()) return
            if (showSignup()) {
              signUp(email(), password()).catch((err) => {
                alert('Sign up failed: ' + err.message)
              })
            } else {
              login(email(), password()).catch((err) => {
                alert('Login failed: ' + err.message)
              })
            }
          }}
        >
          <ion-item>
            <ion-input
              label="Email"
              label-placement="floating"
              id="email"
              type="email"
              .value=${email}
              @ionInput=${withEventValue(setEmail)}
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Password"
              type="password"
              label-placement="floating"
              id="password"
              .value=${password}
              @ionInput=${withEventValue(setPassword)}
              required
            >
              <ion-input-password-toggle slot="end">
              </ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <ion-button
            color="primary"
            expand="block"
            type="submit"
            .disabled=${formDisabled}
            class="ion-margin-top"
          >
            ${() => (showSignup() ? 'Sign Up' : 'Login')}
          </ion-button>
        </form>
        <ion-row style="margin: 32px 0 16px; align-items: center;">
          <ion-col size="auto">
            <ion-text>
              ${() =>
                showSignup()
                  ? 'Already have an account?'
                  : "Don't have an account?"}
            </ion-text>
          </ion-col>
          <ion-col size="auto">
            <ion-button
              fill="clear"
              color="primary"
              @click=${() => setShowSignup(!showSignup())}
            >
              ${() => (showSignup() ? 'Login' : 'Sign Up')}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-card-content>
    </ion-card>
  `
}
