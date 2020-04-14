import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Clipz } from './clipboard';
import { AngularFireAuth } from '@angular/fire/auth';

import { auth } from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  clips: string[] = [];

  constructor(
    private firestore: AngularFirestore,
    public fireAuth: AngularFireAuth
  ) {

  }

  login() {
    this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider())
      .then((user) => console.log('logged in :) ', user))
      .catch((error) => console.log('error: ', error));
  }

  logout() {
    this.fireAuth.signOut();
  }
}
