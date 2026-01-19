import { html } from 'solit-html'
import './style.css'
import '@m3e/app-bar'
import '@m3e/theme'
import { isLoggedIn, logout } from './dataService'
import { LoginView } from './components/Login'
import '@m3e/icon'
import '@m3e/icon-button'

export function App() {
  return html`<m3e-theme>
    ${() =>
      isLoggedIn()
        ? html`<m3e-app-bar>
              <span slot="title">Dodoc</span>
              <m3e-icon-button
                slot="trailing-icon"
                aria-label="Logout"
                @click=${logout}
              >
                <m3e-icon name="logout"></m3e-icon>
              </m3e-icon-button>
            </m3e-app-bar>
            <main></main>`
        : LoginView()}
  </m3e-theme>`
}
