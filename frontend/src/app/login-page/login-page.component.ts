import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loggedIn = false;

  email = 'e@mailtest.de';
  password = 'password';

  processing = false;
  error = 'someone farted in a super stinky way';

  private userSubscription: Subscription = null;

  constructor(
    private snackBar: MatSnackBar,
    private fireAuth: AngularFireAuth) { }

  ngOnInit() {
    this.userSubscription = this.fireAuth.user.subscribe((user) => this.loggedIn = user !== null);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  logIn() {
    this.error = null;
    this.processing = true;

    this.fireAuth.signInWithEmailAndPassword(this.email, this.password)
      .then((user) => console.log('hooray :)', user))
      .catch((error) => this.error = error)
      .finally(() => this.processing = false);
  }

  signUp() {
    this.error = null;
    this.processing = true;
    this.fireAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then((user) => console.log('user created :)', user))
      .catch((error) => this.error = error)
      .finally(() => this.processing = false);
  }

  forgotPassword() {
    this.error = null;
    this.processing = true;
    this.fireAuth.sendPasswordResetEmail(this.email)
      .then(() => { this.snackBar.open('We\'ve sent an email to your spam folder.', null, { duration: 2000 }); })
      .catch((error) => this.error = error)
      .finally(() => this.processing = false);
  }

  confirmError() {
    this.error = null;
  }
}
