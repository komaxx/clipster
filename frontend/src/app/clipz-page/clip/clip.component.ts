import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clip } from 'src/app/clipz-page/clipz';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
  animations: [
    trigger('animationState', [
      state('initial', style({ height: '0px', opacity: 0.2, 'background-color': '#ACA' })),
      state('live', style({ height: '*', opacity: 1 })),
      state('clicked', style({ 'box-shadow': '0 0' })),
      state('deleted', style({ height: '0', opacity: 0, 'background-color': '#F00', 'margin-bottom': 0 })),

      transition('initial => live', animate(100)),
      transition('live => deleted', animate(300)),
      transition('live => clicked', animate(50)),
      transition('clicked => live', animate(150)),
    ])
  ]
})
export class ClipComponent implements OnInit {
  @HostBinding('@animationState')
  animationState: 'initial' | 'live' | 'deleted' | 'clicked' = 'initial';

  @Input()
  clip: Clip;

  get clipIsLink(): boolean {
    try {
      const _ = new URL(this.clip.text);
    } catch (e) {
      return false;
    }
    return true;
  }

  constructor(
    private snackBar: MatSnackBar,
    private firebaseDb: AngularFireDatabase,
    private fireAuth: AngularFireAuth) {
  }

  ngOnInit() {
    setTimeout(() => this.animationState = 'live', 1);
  }

  @HostListener('click')
  onClick() {
    this.animationState = 'clicked';

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

    setTimeout(() => this.animationState = 'live', 60);
  }

  async delete(event) {
    event.stopPropagation();

    this.animationState = 'deleted';
    // give click-feedback some time to work
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const userId = (await this.fireAuth.currentUser).uid;
      await this.firebaseDb.object(`/clipz/${userId}/clipz/${this.clip.id}`).remove();
    } catch (e) {
      this.snackBar.open(`Deletion failed :'( ${e}`);
    }
  }
}
