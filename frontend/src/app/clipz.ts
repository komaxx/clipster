import { firestore } from 'firebase';

export interface Clip {
    id: string;
    text: string;

    // time is missing right after creation until successful syncing with the server
    time: string | null;
}
