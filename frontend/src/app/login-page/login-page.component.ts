import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { User, auth } from 'firebase';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loggedIn = false;

  email = 'my@email.de';
  password = 'password';

  processing = false;
  error = null;

  private userSubscription: Subscription = null;

  constructor(private fireAuth: AngularFireAuth) { }

  ngOnInit() {
    this.userSubscription = this.fireAuth.user.subscribe((user) => this.loggedIn = user !== null);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  logIn() {
    console.log('logging in...');
    this.processing = true;

    this.fireAuth.signInWithEmailAndPassword(this.email, this.password)
      .then((user) => console.log('hooray :)', user))
      .catch((error) => this.error = error)
      .finally(() => this.processing = false);
  }

  signUp() {
    this.processing = true;
    this.fireAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then((user) => console.log('user created :)', user))
      .catch((error) => this.error = error)
      .finally(() => this.processing = false);
  }

  forgotPassword() {

  }

  confirmError() {
    this.error = null;
  }
}
