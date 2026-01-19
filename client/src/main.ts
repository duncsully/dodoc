import { render } from 'lit-html'
import { App } from './App'

const mount = document.querySelector<HTMLDivElement>('#app')!
render(App(), mount)
