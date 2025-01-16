# Push Notifications

This is a preliminary investigation of how to potentially implement push
notifications. It looks like FCM can do all three platforms, that could be a
safer approach for the future. Although that requires a Google Firebase project
and credentials, and web-push requires no registration with any service.

## Use Case

We would like to send push notifications to users to remind them of their
upcoming shifts, or as a call if volunteers are needed.

## Browser: web-push

* https://github.com/web-push-libs/web-push
* https://stackoverflow.com/questions/40392257/what-is-vapid-and-why-is-it-useful
* https://web.dev/articles/push-notifications-how-push-works
* https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers

The website must request permissions to send notifications from the user via the
[Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) from
inside a service worker. The resulting `PushSubscription` object then needs to
be sent to the server and persisted.

The server needs to have a VAPID key pair to identify itself to the push
notification service. No other registration/verification/identification is
required to send web push notifications.

The server sends the push notification to the endpoint specified in the
`PushSubscription`. The push service then delivers the notification to the
browser, which in turn hands the notification to the service worker via the
`onpush` event.

## iPhone: Apple Push Notification service (APNs)

* https://developer.apple.com/notifications/
* https://github.com/parse-community/node-apn

```shell
npm install @parse/node-apn --save
```

Connects to Apple sandbox by default. Requires `NODE_ENV=production` for actual notification sending.

```javascript
var apn = require('@parse/node-apn');

var options = {
    token: {
        key: "path/to/APNsAuthKey_XXXXXXXXXX.p8",
        keyId: "key-id",
        teamId: "developer-team-id"
    },
    production: false
};

var apnProvider = new apn.Provider(options);

let deviceToken = "a9d0ed10e9cfd022a61cb08753f49c5a0b0dfb383697bf9f9d750a1003da19c7"

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
note.payload = {'messageFrom': 'John Appleseed'};
note.topic = "<your-app-bundle-id>";

apnProvider.send(note, deviceToken).then( (result) => {
    // see documentation for an explanation of result
});

// on service shutdown:
apnProvider.shutdown();
```

## Android: Firebase Cloud Messaging (FCM)

* https://firebase.google.com/docs/cloud-messaging
* https://github.com/firebase/firebase-admin-node

Docs:
* https://firebase.google.com/docs/admin/setup
* https://firebase.google.com/docs/cloud-messaging/fcm-architecture
* https://firebase.google.com/docs/cloud-messaging
* https://firebase.google.com/docs/cloud-messaging/manage-tokens

```shell
npm install --save firebase-admin
```

Authentication:
```shell
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
```

```js
import { initializeApp } from "firebase-admin/app";

const app = initializeApp({
    credential: applicationDefault(), // to use the GOOGLE_APPLICATION_CREDENTIALS env variable
});

// This registration token comes from the client FCM SDKs.
const registrationToken = 'YOUR_REGISTRATION_TOKEN';

// notification message (handled by the FCM SDK in the app):
const nMessage = {
    token: registrationToken,
    notification: {
        title: "Bla Blub",
        body: "yap yap yap yap yap",
    }
};

// data message (handled by the client app code):
const dMessage = {
    token: registrationToken,
    data: {
        // anything can go here
    },
};

getMessaging()
    .send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
```
