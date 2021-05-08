/*
    Creation Time: 2018 - Nov - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import firebase from 'firebase';

export default class NotificationService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationService();
        }

        return this.instance;
    }

    private static instance: NotificationService;
    private readonly app: firebase.app.App | undefined;
    private readonly messaging: firebase.messaging.Messaging | undefined;

    private constructor() {
        try {
            this.app = firebase.initializeApp({
                apiKey: "AIzaSyASXB-kW-qY-JqEEe0L3uXzRRnxDHHQx-M",
                appId: "1:1012919192766:web:8d7a9f9badcf9c341362ef",
                authDomain: "river-chat.firebaseapp.com",
                databaseURL: "https://river-chat.firebaseio.com",
                measurementId: "G-3JG2S2R7LQ",
                messagingSenderId: "1012919192766",
                projectId: "river-chat",
                storageBucket: "river-chat.appspot.com",
            });
        } catch (e) {
            window.console.debug(e);
        }

        if (firebase.messaging.isSupported()) {
            this.messaging = firebase.messaging(this.app);

            Notification.requestPermission().then(() => {
                window.console.warn('Notification permission granted.');
                // TODO(developer): Retrieve an Instance ID token for use with FCM.
                // ...
            }).catch((err) => {
                window.console.info('Unable to get permission to notify.', err);
            });

            this.messaging.onMessage((data) => {
                // window.console.debug(data);
            });
        } else {
            // @ts-ignore
            if (window.Notification) {
                Notification.requestPermission();
            }
        }
    }

    public initToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.messaging) {
                reject();
                return;
            }
            this.messaging.getToken().then((currentToken) => {
                if (currentToken) {
                    resolve(currentToken);
                    // sendTokenToServer(currentToken);
                    // updateUIForPushEnabled(currentToken);
                } else {
                    // Show permission request.
                    // console.log('No Instance ID token available. Request permission to generate one.');
                    // Show permission UI.
                    // updateUIForPushPermissionRequired();
                    // setTokenSentToServer(false);
                    reject(null);
                }
            }).catch((err) => {
                window.console.debug('An error occurred while retrieving token. ', err);
                // showToken('Error retrieving Instance ID token. ', err);
                // setTokenSentToServer(false);
                reject(err);
            });
        });
    }
}
