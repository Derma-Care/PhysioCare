importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyApKucCeDspoqLR-hLZOFm7ZKMJBza281c',
  authDomain: 'ccms-45d7d.firebaseapp.com',
  projectId: 'ccms-45d7d',
  messagingSenderId: '386304374153',
  appId: '1:386304374153:web:a38254c2401db7bafd9d58',
})

const messaging = firebase.messaging()

// ─── Helper: Persist notification to localStorage so the app can
//     pick it up when it comes back to the foreground / is re-opened ────────
async function persistNotificationToStorage(payload) {
  try {
    const notif = {
      id: Date.now(),
      title: payload.notification?.title || 'Clinic Notification',
      message: payload.notification?.body || '',
      patientName: payload.data?.patientName || '',
      mobileNumber: payload.data?.mobileNumber || '',
      patientId: payload.data?.patientId || '',
      bookingId: payload.data?.bookingId || '',
      type: payload.data?.type || '',
      path: payload.data?.path || '',
      receivedAt: Date.now(),
    }

    // Save notification in IndexedDB
    await storeInIDB(notif)

    console.log("[SW] Notification saved successfully")

    // Send to open tabs
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    windowClients.forEach((client) => {
      client.postMessage({
        type: 'BACKGROUND_NOTIFICATION',
        notif,
      })
    })

    // BroadcastChannel
    const channel = new BroadcastChannel('fcm_background_channel')
    channel.postMessage({
      type: 'BACKGROUND_NOTIFICATION',
      notif,
    })

    setTimeout(() => channel.close(), 1000)
  } catch (e) {
    console.error('[SW] persistNotificationToStorage error:', e)
  }
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
const IDB_NAME = 'physio_sw_store'
const IDB_STORE = 'pending_notifications'

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE, { keyPath: 'id' })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

async function storeInIDB(notif) {
  try {
    const db = await openIDB()

    const tx = db.transaction(IDB_STORE, 'readwrite')

    tx.objectStore(IDB_STORE).put(notif)

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = reject
    })

    console.log("[SW] Notification stored in IndexedDB", notif)

    db.close()

  } catch (e) {
    console.error("[SW] storeInIDB error", e)
  }
}

// ─── Background message handler ───────────────────────────────────────────────
messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Background message received:', payload)

  const title = payload.notification?.title || 'Clinic Notification'

  const options = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data || {},
    tag: 'physio-notification',
    renotify: true,
  }

  // IMPORTANT
  await persistNotificationToStorage(payload)

  return self.registration.showNotification(title, options)
})

// ─── Handle notification click (brings the app to front) ─────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}

  let targetUrl = '/'
  if (data.path) {
    targetUrl = data.path
  } else if (data.patientId && (data.type === 'SESSION_FEEDBACK')) {
    const bookingParam = data.bookingId ? `&bookingId=${data.bookingId}` : ''
    targetUrl = `/session-feedback?patientId=${data.patientId}${bookingParam}`
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({ type: 'NOTIFICATION_CLICK', notif: { path: targetUrl, ...data } })
          return
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
