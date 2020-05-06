import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase';
import { Observable, of, interval, timer } from 'rxjs';
import { map, shareReplay, switchMap, tap, take } from 'rxjs/operators';
import { ClipUpload } from './clip-upload';
import { Clip } from './clip';
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

  /**
   * Abort a running upload. No-op if not uploading.
   */
  public cancel(upload: ClipUpload) {
    if (upload.status !== 'uploading') {
      return;
    }
    upload.task?.cancel();
    upload.status = 'canceled';
  }

  /**
   * Remove a finished upload. No-op if not yet finished
   */
  public acknowledge(toAck: ClipUpload) {
    if (toAck.status === 'uploading' || toAck.status === 'initial') {
      return;
    }

    // not really required. But better be safe.
    toAck.task?.cancel();
    this.uploads = this.uploads.filter((up) => up !== toAck);
  }


  // //////////////////////////////////////////////////////////////////
  // loading

  private parseClipSnapshot(data): Clip[] {
    const clipShot = data.map((entry) => {
      const clipData = entry.payload.val();
      const clip: Clip = {
        id: entry.key,
        // tslint:disable-next-line: no-string-literal
        text: clipData['text'],
        // tslint:disable-next-line: no-string-literal
        time: clipData['time'],
        // tslint:disable-next-line: no-string-literal
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
      const text = event.clipboardData.getData('text/plain');
      // const storedHtmlFileName = await this.uploadClipAsHtml(event, userId);
      const storedHtmlFileName = null;

      this.createClip(userId, text, storedHtmlFileName);
      return;
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < event.clipboardData.files.length; i++) {
      this.upload(event.clipboardData.files[i], userId);
    }
  }


  // TODO: Later on, copy the formatted text as well! Shows up as html text
  //
  // private async uploadClipAsHtml(event: ClipboardEvent, userId: string): Promise<string | null> {
  //   const plainText = event.clipboardData.getData('text/plain');
  //   const htmlText = event.clipboardData.getData('text/html');
  //   if (htmlText?.length < 1) { return null; }

  //   try {
  //     const storageFileName = `snippet_${(new Date()).getMilliseconds()}_${btoa(plainText).substring(0, 15)}.html`;
  //     const storeRef = this.fireStorage.ref(`${userId}/flz/${storageFileName}`);
  //     await storeRef.putString(htmlText).then();
  //     return storageFileName;
  //   } catch (e) {
  //     console.error('Upload as html failed. Will be posted without html.', e);

  //     return null;
  //   }
  // }

  async createClipForDropEvent(event: DragEvent) {
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
    const clipUpload = new ClipUpload(file.name);
    this.uploads.push(clipUpload);

    const storageFileName = this.sanitizedFileName(file);
    clipUpload.status = 'uploading';

    const previewFile = this.createPreview(file);
    console.log('previewFile:', previewFile);

    try {
      const storeRef = this.fireStorage.ref(`${userId}/flz/${storageFileName}`);
      const upload = storeRef.put(file, {});
      clipUpload.task = upload;

      upload.percentageChanges().subscribe((percentage) => clipUpload.progress = percentage);
      await upload.then((_) => console.log('upload complete')).catch((error) => console.error(error));

      const shownText = file.name;
      const downloadUrl: string = (await (await upload).ref.getDownloadURL()) as string;
      await this.createClip(userId, shownText, storageFileName, downloadUrl);

      this.uploads = this.uploads.filter((up) => up !== clipUpload);

      // clipUpload.status = 'finished';
      // this.acknowledge(clipUpload);
    } catch (e) {
      console.error('upload failed :(', e);
      clipUpload.status = 'failed';
      clipUpload.error = e;

      return;
    }
  }

  private async createPreview(file: File): Promise<string> | null {
    if (!file.type.startsWith('image/')) {
      // Can only do images so far.
      return null;
    }

    if (file.size > 30 * 1024 * 1024) {
      // Don't process too large images. IE will just crash, proper browsers take forever
      return null;
    }

    let srcDataUrl = null;
    try {
      srcDataUrl = await this.readSourceAsDataURL(file);
    } catch (e) {
      console.log('Could not read source as data URL. Not appending preview');
      return null;
    }

    const image = new Image();
    image.src = srcDataUrl;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 200;

    context.drawImage(image, 0, 0, 200, 200);

    return canvas.toDataURL('image/jpg', 70);
  }

  private async readSourceAsDataURL(file: File): Promise<string> {
    const reader = new FileReader();

    return new Promise(
      (resolve, reject) => {
        reader.onerror = () => {
          console.log('ERROR');
          reject('Couldn\'t read file');
          reader.abort();
        };

        reader.onload = () => {
          resolve(reader.result as string);
        };

        reader.readAsDataURL(file);
      }
    );
  }

  /**
   * Create a string that can be used to store the file in Firebase from a file.
   */
  private sanitizedFileName(file: File): string {
    // TODO: This is probably not fine.
    const fileName = file.name;
    return `${(new Date()).getMilliseconds()}_${fileName}`;
  }

  /**
   * Take all the given data and dump it into Firebase to make a new clip
   */
  private async createClip(
    userId: string,
    text: string,
    fileName?: string | null,
    downloadUrl?: string | null): Promise<firebase.database.Reference> {

    const timeStamp = firebase.database.ServerValue.TIMESTAMP;
    const reference = await this.firebaseDb
      .list(`/clipz/${userId}/clipz`)
      .push({ text, time: timeStamp, file: downloadUrl ?? null, fileName });
    return reference;
  }
}
