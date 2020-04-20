import { AngularFireUploadTask } from '@angular/fire/storage/task';

export class ClipUpload {
    status: 'initial' | 'uploading' | 'finished' | 'failed' = 'initial';
    progress = 0;
    error = '';
    task: AngularFireUploadTask | null;

    constructor(public fileName: string) {
        this.fileName = fileName;
    }
}
