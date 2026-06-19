import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyApKucCeDspoqLR-hLZOFm7ZKMJBza281c',
  authDomain: 'ccms-45d7d.firebaseapp.com',
  projectId: 'ccms-45d7d',
  storageBucket: 'ccms-45d7d.appspot.com',
  messagingSenderId: '386304374153',
  appId: '1:386304374153:web:a38254c2401db7bafd9d58',
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

// ─── Shared IndexedDB constants (must match service worker) ───────────────────
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

/**
 * Reads ALL pending notifications that the service worker stored while
 * the app was killed / in the background, then clears them from IDB.
 * Returns an array of notification objects (may be empty).
 */
export const readPendingNotificationsFromIDB = async () => {
  try {
    const db = await openIDB()
    const tx = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)

    const items = await new Promise((res, rej) => {
      const req = store.getAll()
      req.onsuccess = () => res(req.result)
      req.onerror = () => rej(req.error)
    })

    // Clear after reading so we don't show duplicates on next refresh
    await new Promise((res, rej) => {
      const clearReq = store.clear()
      clearReq.onsuccess = res
      clearReq.onerror = rej
    })

    await new Promise((res, rej) => {
      tx.oncomplete = res
      tx.onerror = rej
    })
    db.close()
    return items || []
  } catch (e) {
    console.error('[firebase.js] readPendingNotificationsFromIDB error:', e)
    return []
  }
}

/**
 * Subscribes to the BroadcastChannel that the service worker uses to
 * notify open tabs of background messages in real-time.
 * Returns an unsubscribe function — call it on component unmount.
 */
export const subscribeToBroadcastChannel = (onNotif) => {
  if (!('BroadcastChannel' in window)) return () => { }
  const channel = new BroadcastChannel('fcm_background_channel')
  channel.onmessage = (event) => {
    if (event.data?.type === 'BACKGROUND_NOTIFICATION' && event.data?.notif) {
      onNotif(event.data.notif)
    }
  }
  return () => channel.close()
}

// ─── GET TOKEN ────────────────────────────────────────────────────────────────
export const getFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.')
      return ''
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    await navigator.serviceWorker.ready;

    console.log("SW registered:", registration);

    const token = await getToken(messaging, {
      vapidKey: 'BLzhc9fU0Jm5Xxqp1pLAzphwK2ff20MLyjZGVO_B93KNFcBoiK1Q0EsEvVKNBcS0-KD5xeWjLfGzhs6t7HH-nls',
      serviceWorkerRegistration: registration,
    })

    console.log('FCM TOKEN:', token)
    return token
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err)

    // Auto-fix for VersionError / IndexedDB corruption
    if (err.message && err.message.includes('VersionError')) {
      console.log('Attempting to clear corrupted Firebase IndexedDB...')
      try {
        const dbs = await window.indexedDB.databases()
        dbs.forEach((db) => {
          if (db.name.includes('firebase') || db.name.includes('fcm')) {
            window.indexedDB.deleteDatabase(db.name)
          }
        })
        console.log('Firebase IndexedDB cleared. Please refresh.')
      } catch (dbErr) {
        console.error('Failed to clear IndexedDB:', dbErr)
      }
    }

    return ''
  }
}

// ─── FOREGROUND LISTENER ──────────────────────────────────────────────────────
export const listenNotification = (onMessageReceived) => {
  onMessage(messaging, (payload) => {
    console.log('[firebase.js] Foreground message:', payload)
    if (onMessageReceived) {
      onMessageReceived(payload)
    }
  })
}
