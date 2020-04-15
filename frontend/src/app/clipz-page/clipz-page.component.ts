import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'firebase';
import { TextClip } from '../clipz';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';


@Component({
  selector: 'app-clipz-page',
  templateUrl: './clipz-page.component.html',
  styleUrls: ['./clipz-page.component.scss']
})
export class ClipzPageComponent implements OnInit, OnDestroy {
  user: User | null = null;
  clipz: TextClip[] = [];

  private userSubscription: Subscription | null = null;
  private clipzSubscription: Subscription | null = null;

  constructor(private fireAuth: AngularFireAuth, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.subscribeToData();
    this.registerForPasteEvents();
  }

  private registerForPasteEvents() {
    document.addEventListener('paste', (event) => {
      console.log(event);

      const text = event.clipboardData.getData('Text');
      this.uploadNewTextClip(text);

      event.preventDefault();
      event.stopPropagation();
    });
  }

  private uploadNewTextClip(text: string) {
    const userId = this.user?.uid;
    if (!userId) {
      // not logged in
      return;
    }

    const timeStamp = firebase.firestore.FieldValue.serverTimestamp();
    this.firestore.collection('clipz').doc(userId).collection('clipz').add({
      text,
      time: timeStamp
    });
  }

  private subscribeToData() {
    this.userSubscription = this.fireAuth.user.subscribe((user) => {
      this.user = user;
      this.clipzSubscription?.unsubscribe();

      const userId = this.user?.uid;
      if (userId) {
        this.clipzSubscription = this.firestore.collection('clipz').doc(userId).collection('clipz').valueChanges()
          .subscribe((docs) => {
            const clips = docs.map((doc) => doc as TextClip);
            const sortedClips = clips.sort((a, b) => {
              const aTime = a.time?.toMillis() ?? Number.MAX_SAFE_INTEGER;
              const bTime = b.time?.toMillis() ?? Number.MAX_SAFE_INTEGER;
              return bTime - aTime;
            });
            this.clipz = sortedClips;
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.clipzSubscription?.unsubscribe();
  }

  logOut() {
    this.fireAuth.signOut();
  }

  deleteAccount() {
    this.user.delete();
  }
}
