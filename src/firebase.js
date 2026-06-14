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

// ✅ GET TOKEN
export const getFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.')
      return ''
    }

    // Explicitly register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

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
        dbs.forEach(db => {
          if (db.name.includes('firebase') || db.name.includes('fcm')) {
            window.indexedDB.deleteDatabase(db.name)
          }
        })
        console.log('Firebase IndexedDB cleared. Please refresh the page and try logging in again.')
        // We could retry here, but usually a refresh is safer to re-init firebase.
      } catch (dbErr) {
        console.error('Failed to clear IndexedDB:', dbErr)
      }
    }
    
    return ''
  }
}

// ✅ FOREGROUND LISTENER
export const listenNotification = (onMessageReceived) => {
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload)

    // Optional: trigger browser native notification
    // new Notification(payload.notification?.title || 'Notification', {
    //   body: payload.notification?.body,
    //   icon: '/src/assets/images/dermalogo.png',
    // })

    if (onMessageReceived) {
      onMessageReceived(payload)
    }
  })
}
