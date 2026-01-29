import { html } from 'solit-html'
import './style.css'
import { isLoggedIn, useSyncDocuments } from './dataService'
import { LoginView } from './views/LoginView'
import './theme/md3/theme.css'
import { HomeView } from './views/HomeView'
import { DocumentView } from './views/DocumentView'
import { DocumentFormView } from './views/DocumentFormView'
import { customElementFrom } from './utils'

export function App() {
  return html`
    <ion-app>
      ${() => (isLoggedIn() ? AuthenticatedApp() : LoginView())}
    </ion-app>
  `
}

function AuthenticatedApp() {
  useSyncDocuments()
  return html`
    <ion-router .useHash=${false}>
      <ion-route url="/" component=${customElementFrom(HomeView)}></ion-route>
      <ion-route
        url="/new"
        component=${customElementFrom(DocumentFormView)}
      ></ion-route>
      <ion-route url="/:id" component=${customElementFrom(DocumentView)}>
      </ion-route>
      <ion-route
        url="/:id/edit"
        component=${customElementFrom(DocumentFormView)}
      ></ion-route>
    </ion-router>
    <ion-router-outlet></ion-router-outlet>
  `
}
