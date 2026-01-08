import { render } from 'lit-html'
import { html } from 'solit-html'
import './style.css'
import '@m3e/app-bar'
import '@m3e/theme'

const mount = document.querySelector<HTMLDivElement>('#app')!
render(App(), mount)

function App() {
  return html`<m3e-theme>
    <m3e-app-bar>
      <span slot="title">Dodoc</span>
    </m3e-app-bar>
  </m3e-theme>`
}
