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

export function relativeTimeFromNow(date: Date | string) {
  const relTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMs = new Date(date).getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)
  const diffWeek = Math.round(diffDay / 7)
  const diffMonth = Math.round(diffDay / 30)
  const diffYear = Math.round(diffDay / 365)

  const unitDiffs = {
    year: diffYear,
    month: diffMonth,
    week: diffWeek,
    day: diffDay,
    hour: diffHour,
    minute: diffMin,
    second: diffSec,
  }
  for (const [unit, diff] of Object.entries(unitDiffs)) {
    if (Math.abs(diff) >= 1) {
      return relTimeFormat.format(diff, unit as Intl.RelativeTimeFormatUnit)
    }
  }
  return 'just now'
}
