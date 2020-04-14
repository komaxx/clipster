import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-clipz-page',
  templateUrl: './clipz-page.component.html',
  styleUrls: ['./clipz-page.component.scss']
})
export class ClipzPageComponent implements OnInit, OnDestroy {
  user: User | null = null;

  private userSubscription: Subscription | null = null;
  private clipzSubscription: Subscription | null = null;

  constructor(private fireAuth: AngularFireAuth, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.userSubscription = this.fireAuth.user.subscribe((user) => {
      this.user = user;
      this.clipzSubscription?.unsubscribe();

      const userId = this.user?.uid;
      if (userId) {
        this.clipzSubscription = this.firestore.collection('clipz').doc(userId).valueChanges().subscribe(
          (data) => console.log('DATA!', data),
          (error) => console.error('fail :(', error)
        );
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
}
