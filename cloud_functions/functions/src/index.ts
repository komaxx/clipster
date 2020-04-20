import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// export const pingPong = functions.https.onRequest((request, response) => {
//     response.send(`Pong: ${request.body}`);
// });

export const createDataStructuresForNewUser = functions.region('europe-west3')
    .auth.user().onCreate(async (user, context) => {
        // firebase
        // at this point: Nothing. Data handling is mostly done by the frontent.

        // Nice-to-haves: Welcome email?
    });

export const deleteDataForDeletedUser = functions.region('europe-west3')
    .auth.user().onDelete(async (user, context) => {
        // database
        await admin.database().ref(`clipz/${user.uid}`).remove();
    });

export const deleteFileOnClipDelete = functions.region('europe-west3')
    .database.ref('clipz/{userUID}/clipz/{clipId}')
    .onDelete(async (snapshot, context) => {
        const clipLinkedFileName = snapshot.val().file;
        if (!clipLinkedFileName) { return; }

        const fileLocation = `${context.auth?.uid}/flz/${clipLinkedFileName}`

        try {
            const bucket = admin.storage().bucket();
            const file = bucket.file(fileLocation)
            console.log('deleting ... file/bucket', fileLocation, bucket);
            await file.delete();
            console.log(`DELETED!`);
        } catch (error) {
            console.error('delete failed!', error)
        }
    });

