/* eslint-disable prettier/prettier */
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

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload)

  const title = payload.notification?.title || 'Clinic Notification'

  const options = {
    body: payload.notification?.body,
    icon: '/src/assets/images/dermalogo.png',
    data: payload.data,
  }

  self.registration.showNotification(title, options)
})
