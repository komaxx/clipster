import { firestore } from 'firebase';

export interface Clip {
    id: string;

    text: string;

    file: string | null;

    // time is missing right after creation until successful syncing with the server
    time: string | null;
}
