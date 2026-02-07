import { html } from 'solit-html'
import './style.css'
import { isLoggedIn, useSyncDocuments } from './dataService'
import { LoginView } from './views/LoginView'
import './theme/md3/theme.css'
import { HomeView } from './views/HomeView'
import { DocumentView } from './views/DocumentView'
import { DocumentFormView } from './views/DocumentFormView'
import { customElementFrom } from './utils'
import { ProfileFormView } from './views/ProfileFormView'

export function App() {
  return html`
    <ion-app>
      ${() => (isLoggedIn() ? AuthenticatedApp() : LoginView())}
    </ion-app>
  `
}

const routes = {
  '/': HomeView,
  '/profile': ProfileFormView,
  '/new': DocumentFormView,
  '/:id': DocumentView,
  '/:id/edit': DocumentFormView,
}

const routeElements = Object.entries(routes).map(([path, component]) => {
  return html`<ion-route
    url=${path}
    component=${customElementFrom(component)}
  ></ion-route>`
})

function AuthenticatedApp() {
  useSyncDocuments()
  return html`
    <ion-router .useHash=${false}>${routeElements}</ion-router>
    <ion-router-outlet></ion-router-outlet>
  `
}
