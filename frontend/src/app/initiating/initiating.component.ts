import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-initiating',
  templateUrl: './initiating.component.html',
  styleUrls: ['./initiating.component.scss']
})
export class InitiatingComponent implements OnInit {
  initializationComplete = false;
  fadeOut = false;

  constructor(private fireAuth: AngularFireAuth) { }

  async ngOnInit() {
    await this.fireAuth.user.pipe(take(1)).toPromise();

    this.fadeOut = true;

    setTimeout(() => this.initializationComplete = true, 300);
  }

}
