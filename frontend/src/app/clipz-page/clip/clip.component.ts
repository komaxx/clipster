import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Clip } from 'src/app/clipz';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class ClipComponent implements OnInit {
  @Input()
  clip: Clip;

  constructor(
    private snackBar: MatSnackBar,
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore) { }

  ngOnInit() {
  }

  @HostListener('click', ['$event'])
  onClick(event) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.clip.text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snackBar.open('Copied to clipboard!', null, { duration: 1200 });
  }

  async delete(event) {
    event.stopPropagation();
    // give click-feedback some time to work
    await new Promise(resolve => setTimeout(resolve, 250));

    try {
      const userId = (await this.fireAuth.currentUser).uid;
      await this.firestore.doc(`/clipz/${userId}/clipz/${this.clip.id}`).delete();
    } catch (e) {
      this.snackBar.open(`Deletion failed :'( ${e}`);
    }
  }
}
