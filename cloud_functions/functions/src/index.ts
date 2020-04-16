import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// export const pingPong = functions.https.onRequest((request, response) => {
//     response.send(`Pong: ${request.body}`);
// });

export const createDataStructuresForNewUser = functions.region('europe-west3')
    .auth.user().onCreate(async (user, context) => {
        // firebase
        // const firstClip = await admin.database().ref(`clipz/${user.uid}/clipz`).push()
        // await firstClip.set({ text: "Welcome Firebase", time: admin.database.ServerValue.TIMESTAMP });

        // // firestore
        // const userRootDoc = admin.firestore().collection('clipz').doc(user.uid)
        // await userRootDoc.set({ userEmail: user.email });
        // await userRootDoc.collection('clipz').add({ text: "Welcome! Nice that you're here :)", time: admin.database.ServerValue.TIMESTAMP });
    });

export const deleteDataForDeletedUser = functions.region('europe-west3')
    .auth.user().onDelete(async (user, context) => {
        await admin.database().ref(`clipz/${user.uid}`).remove();
    });
