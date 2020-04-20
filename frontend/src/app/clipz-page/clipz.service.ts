import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase';
import { Observable, of, interval } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ClipUpload } from './clip-upload';
import { Clip } from './clipz';
import { AngularFireStorage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class ClipzService {
  latestClips: Clip[] = [];
  user: firebase.User | null = null;

  clipz: Observable<Clip[]>;
  uploads: ClipUpload[] = [];

  constructor(
    private fireAuth: AngularFireAuth,
    private fireStorage: AngularFireStorage,
    private firebaseDb: AngularFireDatabase) {


    this.uploads = [
      new ClipUpload('File1'),
      new ClipUpload('File2'),
    ];

    interval(250).subscribe(
      () => {
        this.uploads[0].progress = new Date().getMilliseconds() * 3 % 100;
        this.uploads[1].progress = new Date().getMilliseconds() * 5 % 100;
      }
    );

    setTimeout(() => {
      this.uploads[0].status = 'uploading';
      this.uploads[1].status = 'uploading';
    }, 1000);

    setTimeout(() => {
      this.uploads[0].status = 'failed';
      this.uploads[1].status = 'finished';
    }, 4000);

    this.clipz = fireAuth.user.pipe(
      switchMap((user) => {
        this.user = user;

        if (!user) {
          this.latestClips = [];
          return of([]);
        }

        return this.firebaseDb.list(`/clipz/${user.uid}/clipz`).snapshotChanges().pipe(
          map(this.parseClipSnapshot),
          map(this.sortClips),
          map(this.keepOldClips.bind(this)),
          tap(this.storeClipzSnapshot.bind(this))
        );
      }),
      shareReplay()
    ) as Observable<Clip[]>;
  }

  cancel(upload: ClipUpload) {
    if (upload.status !== 'uploading') {
      return;
    }
    upload.task?.cancel();
    upload.status = 'failed';
  }


  // //////////////////////////////////////////////////////////////////
  // loading

  private parseClipSnapshot(data): Clip[] {
    const clipShot = data.map((entry) => {
      const clipData = entry.payload.val();
      const clip: Clip = {
        id: entry.key,
        text: clipData['text'],
        time: clipData['time'],
        file: clipData['file']
      };
      return clip;
    });
    return clipShot;
  }

  private sortClips(clips: Clip[]): Clip[] {
    return clips.sort((a, b) => {
      const aTime = Number(a.time) ?? Number.MAX_SAFE_INTEGER;
      const bTime = Number(b.time) ?? Number.MAX_SAFE_INTEGER;
      return bTime - aTime;
    });
  }

  private keepOldClips(clips: Clip[]): Clip[] {
    return clips.map((nuClip) => {
      const matchingOldClip = this.latestClips.find((oldClip) => oldClip.id === nuClip.id);
      return matchingOldClip ?? nuClip;
    });
  }

  private storeClipzSnapshot(clips: Clip[]) {
    this.latestClips = clips;
  }

  // //////////////////////////////////////////////////////////////////////
  // pasting

  async createClipForPasteEvent(event: ClipboardEvent) {
    console.log('files', event.clipboardData.files);

    const userId = (await this.fireAuth.currentUser).uid;
    if (!userId) {
      // not logged in. Ignore.
      return;
    }

    if (event.clipboardData.files.length < 1) {
      // simple text pasting
      const text = event.clipboardData.getData('Text');
      this.createClip(userId, text);
      return;
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < event.clipboardData.files.length; i++) {
      this.upload(event.clipboardData.files[i], userId);
    }
  }

  async createClipForDropEvent(event: DragEvent) {
    console.log('files', event.dataTransfer.files);

    const userId = (await this.fireAuth.currentUser).uid;
    if (!userId) {
      // not logged in. Ignore.
      return;
    }

    if (event.dataTransfer.files.length < 1) {
      // simple text pasting
      const text = event.dataTransfer.getData('Text');
      this.createClip(userId, text);
      return;
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      this.upload(event.dataTransfer.files[i], userId);
    }
  }

  private async upload(file: File, userId: string) {
    console.log('pasting FILE ...', file);

    const clipUpload = new ClipUpload(file.name);
    this.uploads.push(clipUpload);

    const storageFileName = this.sanitizedFileName(file);
    console.log('storage fileName', storageFileName);

    clipUpload.status = 'uploading';

    try {
      const storeRef = this.fireStorage.ref(`${userId}/flz/${storageFileName}`);
      const upload = storeRef.put(file, {});
      clipUpload.task = upload;

      upload.percentageChanges().subscribe((percentage) => clipUpload.progress = percentage);
      await upload.then((dataSnapshot) => console.log('DONE!')).catch((error) => console.error(error));

      console.log('upload complete! Create clip..');

      const shownText = file.name;
      await this.createClip(userId, shownText, storageFileName);

      clipUpload.status = 'finished';
    } catch (e) {
      console.error('upload failed :(', e);
      clipUpload.status = 'failed';
      clipUpload.error = e;

      return;
    }
  }

  private sanitizedFileName(file: File): string {
    // TODO: This is probably not fine.
    const fileName = file.name;
    return `${(new Date()).getMilliseconds()}_${fileName}`;
  }

  private async createClip(userId: string, text: string, storageFileName?: string | null) {
    const timeStamp = firebase.database.ServerValue.TIMESTAMP;
    await this.firebaseDb
      .list(`/clipz/${userId}/clipz`)
      .push({ text, time: timeStamp, file: storageFileName ?? null });
  }
}
