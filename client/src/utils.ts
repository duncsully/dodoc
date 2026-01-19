/**
 * Factory to create event handlers that extract the value from input events,
 * passing it to the provided callback.
 */
export function withEventValue(cb: (value: string) => void) {
  return (e: Event) => cb(e.target ? (e.target as HTMLInputElement).value : '')
}
