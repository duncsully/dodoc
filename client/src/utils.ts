import {
  alertController,
  toastController,
  type AlertOptions,
  type RouterDirection,
} from '@ionic/core'
import { render, type TemplateResult } from 'lit-html'
import { signal } from 'solit-html'

/**
 * Factory to create event handlers that extract the value from input events,
 * passing it to the provided callback.
 */
export function withEventValue(cb: (value: string) => void) {
  return (e: Event) => cb(e.target ? (e.target as HTMLInputElement).value : '')
}

export async function showToast(message: string) {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    buttons: [
      {
        text: 'OK',
        role: 'cancel',
      },
    ],
  })
  return toast.present()
}

export async function showAlert(message: string, options?: AlertOptions) {
  const alert = await alertController.create({
    message,
    buttons: [
      {
        text: 'OK',
        role: 'cancel',
      },
    ],
    ...options,
  })
  return alert.present()
}

let tagCounter = 0

/**
 * Due to Ionic's web component routing, we need to define custom elements for each route.
 * This utility creates a custom element from a solit-html component function.
 * @returns The generated tag name of the custom element.
 */
export function customElementFrom(component: (props: any) => TemplateResult) {
  class CustomElement extends HTMLElement {
    /**
     * ion-route passes path params directly as properties on the element.
     * Convert this value to a signal so we can track changes.
     *
     * For now, we only support the "id" param, but this should be generalized
     * for arbitrary params if needed in the future.
     */
    idSig = signal('')
    set id(value: string) {
      this.idSig.value = value
    }
    connectedCallback() {
      render(component({ id: this.idSig.get }), this)
    }
  }
  let tagName = `custom-element-${tagCounter++}`
  customElements.define(tagName, CustomElement)
  return tagName
}

// TODO: more graceful method of accessing the router
// TODO: Also support relative routing?
export function navigate(url: string, direction: RouterDirection = 'forward') {
  document.querySelector('ion-router')?.push(url, direction)
}
