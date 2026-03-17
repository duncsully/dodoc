/// <reference lib="webworker" />

self.addEventListener('push', (e) => {
  /**
   * @type {PushEvent}
   */
  const event = e
  const { title, body, data } = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification('Dodoc', {
      title,
      body,
      data,
      requireInteraction: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  const url = new URL(event.notification.data.docId ?? '', self.location.origin)
  event.notification.close() // Android needs explicit close.
  event.waitUntil(clients.openWindow(url))
})
