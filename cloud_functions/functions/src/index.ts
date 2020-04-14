import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const pingPong = functions.https.onRequest((request, response) => {
    response.send(`Pong: ${request.body}`);
});

export const createDataStructuresForNewUser = functions.region('europe-west3')
    .auth.user().onCreate((user, context) => {

        return admin
            .firestore().collection('clipz').doc(user.uid)
            .set({
                userEmail: user.email
            });
    });

export const deleteDataForDeletedUser = functions.region('europe-west3')
    .auth.user().onDelete((user, context) => {
        return admin
            .firestore().collection('clipz').doc(user.uid)
            .delete();
    });
