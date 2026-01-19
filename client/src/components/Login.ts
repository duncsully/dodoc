import { html, state } from 'solit-html'
import { login, signUp } from '../dataService'
import '@m3e/form-field'
import '@m3e/card'
import '@m3e/heading'
import '@m3e/button'
import '@m3e/divider'
import '@m3e/icon-button'
import '@m3e/icon'
import { withEventValue } from '../utils'

export function LoginView() {
  const [showSignup, setShowSignup] = state(false)
  const [showPassword, setShowPassword] = state(false)

  const [email, setEmail] = state('')
  const [password, setPassword] = state('')
  const formDisabled = () => !email().length || !password().length

  return html`<m3e-card variant="elevated" style="margin: 16px;">
    <m3e-heading slot="header" variant="display" size="small">
      ${() => (showSignup() ? 'Sign Up' : 'Login')}
    </m3e-heading>
    <div slot="content">
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
        style="margin-top: 16px;"
      >
        <m3e-form-field style="width: 100%;">
          <label slot="label" for="email">Email</label>
          <input
            id="email"
            type="email"
            .value=${email}
            @input=${withEventValue(setEmail)}
          />
        </m3e-form-field>
        <m3e-form-field style="width: 100%;">
          <label slot="label" for="password">Password</label>
          <input
            id="password"
            type=${() => (showPassword() ? 'text' : 'password')}
            .value=${password}
            @input=${withEventValue(setPassword)}
          />
          <m3e-icon-button
            slot="suffix"
            @click=${() => setShowPassword(!showPassword())}
          >
            <m3e-icon
              name=${() => (showPassword() ? 'visibility_off' : 'visibility')}
            >
            </m3e-icon>
          </m3e-icon-button>
        </m3e-form-field>
        <m3e-button
          type="submit"
          variant="filled"
          shape="square"
          style="display: block"
          .disabled=${formDisabled}
        >
          ${() => (showSignup() ? 'Sign Up' : 'Login')}
        </m3e-button>
      </form>
      <m3e-divider style="margin: 32px 0 16px;"></m3e-divider>
      <div style="display: flex; align-items: center;">
        <span
          >${() =>
            showSignup()
              ? 'Already have an account?'
              : "Don't have an account?"}</span
        >
        <m3e-button @click=${() => setShowSignup(!showSignup())}>
          ${() => (showSignup() ? 'Login' : 'Sign Up')}
        </m3e-button>
      </div>
    </div>
  </m3e-card>`
}
