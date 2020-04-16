import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-account-dialog',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss']
})
export class DeleteAccountDialogComponent implements OnInit {
  password = '';
  processing = false;

  constructor(
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
    private fireAuth: AngularFireAuth) {

  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  async deleteNow() {
    this.processing = true;
    await this.doDelete();
    this.processing = false;
  }

  private async doDelete() {
    let user: firebase.User;
    try {
      user = await this.fireAuth.currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential(user?.email, this.password);
      await user.reauthenticateWithCredential(credential);
    } catch (e) {
      console.log('failed :(', e);
      this.snackBar.open('That\'s not your password.', null, { duration: 1200 });
      return;
    }

    try {
      await user.delete();
    } catch (e) {
      this.snackBar.open('Failed. Lame :(', null, { duration: 1200 });
      return;
    }
    this.snackBar.open('✔️ Account deleted!', null, { duration: 1200 });
    this.dialogRef.close();
  }
}
