/* eslint-disable */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.4.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.4.3/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyASXB-kW-qY-JqEEe0L3uXzRRnxDHHQx-M",
    appId: "1:1012919192766:web:8d7a9f9badcf9c341362ef",
    authDomain: "river-chat.firebaseapp.com",
    databaseURL: "https://river-chat.firebaseio.com",
    measurementId: "G-3JG2S2R7LQ",
    messagingSenderId: "1012919192766",
    projectId: "river-chat",
    storageBucket: "river-chat.appspot.com",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // // Customize notification here
    const notificationTitle = 'Background Message Title';
    // const notificationOptions = {
    //     body: 'Background Message body.',
    //     icon: '/firebase-logo.png'
    // };
    //
    self.registration.showNotification(notificationTitle, JSON.stringify(payload));
});
