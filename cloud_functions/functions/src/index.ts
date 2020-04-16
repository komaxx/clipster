import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const createDataStructuresForNewUser = functions.region('europe-west3')
    .auth.user().onCreate((user, context) => {
        const userRootDoc = admin.firestore().collection('clipz').doc(user.uid)

        const createRootDocPromise = userRootDoc.set({ userEmail: user.email });
        const createFirstClipPromise = userRootDoc.collection('clipz').add({ text: "Welcome!", time: admin.firestore.FieldValue.serverTimestamp() });

        return createRootDocPromise.then(() => createFirstClipPromise);
    });

export const deleteDataForDeletedUser = functions.region('europe-west3')
    .auth.user().onDelete((user, context) => {
        return admin
            .firestore().collection('clipz').doc(user.uid)
            .delete();
    });
