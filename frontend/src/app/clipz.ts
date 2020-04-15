import { firestore } from 'firebase';

export interface TextClip {
    text: string;
    time: firestore.Timestamp;
}
