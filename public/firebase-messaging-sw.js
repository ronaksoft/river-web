if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../firebase-messaging-sw.js')
        .then(function (registration) {
            window.console.log('Registration successful, scope is:', registration.scope);
        }).catch(function (err) {
        window.console.log('Service worker registration failed, error:', err);
    });
    importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
    importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

    firebase.initializeApp({
        'messagingSenderId': '1012919192766'
    });

    // Retrieve an instance of Firebase Messaging so that it can handle background
    // messages.
    const messaging = firebase.messaging();

    messaging.setBackgroundMessageHandler(function (payload) {
        // Customize notification here
        const notificationTitle = JSON.stringify(payload);
        const notificationOptions = {
            body: notificationTitle,
            icon: '/firebase-logo.png'
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
    });
}
