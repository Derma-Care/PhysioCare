/* eslint-disable prettier/prettier */
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
    await Notification.requestPermission()

    const token = await getToken(messaging, {
      vapidKey:
        'BLzhc9fU0Jm5Xxqp1pLAzphwK2ff20MLyjZGVO_B93KNFcBoiK1Q0EsEvVKNBcS0-KD5xeWjLfGzhs6t7HH-nls',
    })

    console.log('FCM TOKEN:', token)

    return token
  } catch (err) {
    console.log(err)
  }
}

// ✅ FOREGROUND LISTENER
export const listenNotification = () => {
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload)

    new Notification(payload.notification?.title || 'Notification', {
      body: payload.notification?.body,
      icon: '/src/assets/images/dermalogo.png',
    })
  })
}
