import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Pipe } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { firebaseConfig } from 'src/environments/firebaseConfig';
import { MaterialElementsModule } from './material-elements.module';

import { TimeAgoPipe } from 'time-ago-pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ClipzPageComponent } from './clipz-page/clipz-page.component';
import { DeleteAccountDialogComponent } from './clipz-page/delete-account-dialog/delete-account-dialog.component';
import { ClipComponent } from './clipz-page/clip/clip.component';
import { UploadComponent } from './clipz-page/upload/upload.component';
import { InitiatingComponent } from './initiating/initiating.component';


// Super ugly hack to get TimeAgoPipe running on Angular 9
@Pipe({
   name: 'timeAgo',
   pure: false
})
export class TimeAgoExtendsPipe extends TimeAgoPipe { }


@NgModule({
   declarations: [
      AppComponent,
      LoginPageComponent,
      ClipzPageComponent,
      DeleteAccountDialogComponent,
      ClipComponent,
      UploadComponent,
      TimeAgoExtendsPipe,
      InitiatingComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireDatabaseModule,
      AngularFireStorageModule,
      BrowserAnimationsModule,
      MaterialElementsModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
