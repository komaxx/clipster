import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { firebaseConfig } from 'src/environments/firebaseConfig';
import { FormsModule } from '@angular/forms';

import { LoginPageComponent } from './login-page/login-page.component';
import { ClipzPageComponent } from './clipz-page/clipz-page.component';

import { MaterialElementsModule } from './material-elements.module';
import { DeleteAccountDialogComponent } from './clipz-page/delete-account-dialog/delete-account-dialog.component';


@NgModule({
   declarations: [
      AppComponent,
      LoginPageComponent,
      ClipzPageComponent,
      DeleteAccountDialogComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFirestoreModule,
      BrowserAnimationsModule,
      MaterialElementsModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
