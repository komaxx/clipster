import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Clip } from './clip';
import { ClipzService } from './clipz.service';
import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';



@Component({
  selector: 'app-clipz-page',
  templateUrl: './clipz-page.component.html',
  styleUrls: ['./clipz-page.component.scss']
})
export class ClipzPageComponent implements OnInit, OnDestroy {
  clipz: Clip[] = [];

  clipSubscription: Subscription | null = null;
  firstLoadComplete = false;

  inputText = '';
  inputIsFocused = false;

  constructor(
    public clipsService: ClipzService,
    private fireAuth: AngularFireAuth,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.subscribeToData();
    this.registerForPasteEvents();
  }

  private registerForPasteEvents() {
    document.addEventListener('paste', async (event) => {
      if (this.inputIsFocused) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      this.clipsService.createClipForPasteEvent(event);
    });
  }

  inputFocused() {
    this.inputIsFocused = true;
  }

  inputFocusLost() {
    this.inputIsFocused = false;
  }

  pasteFromInputBox() {
    const toPaste = this.inputText.trim();
    if (toPaste.length < 1) {
      return;
    }
    this.clipsService.createClipForText(toPaste);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    console.log('as string:', event.dataTransfer?.getData('text/plain'));

    this.clipsService.createClipForDropEvent(event);
  }

  onDragOver(event: DragEvent) {
    // required to make dropping happen
    event.dataTransfer.dropEffect = 'move';
    event.preventDefault();
    event.stopPropagation();
  }

  private subscribeToData() {
    this.clipSubscription = this.clipsService.clipz.subscribe(
      (clipz) => {
        this.firstLoadComplete = true;
        this.clipz = clipz;
      }
    );
  }

  ngOnDestroy(): void {
    this.clipSubscription?.unsubscribe();
  }

  logOut() {
    this.fireAuth.signOut();
  }

  deleteAccount() {
    this.dialog.open(DeleteAccountDialogComponent);
  }
}
