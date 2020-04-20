import { Component, OnInit, Input } from '@angular/core';
import { ClipUpload } from '../clip-upload';
import { ClipzService } from '../clipz.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @Input()
  upload: ClipUpload;

  constructor(private clipzService: ClipzService) {
  }

  ngOnInit() {
    console.log('init', this.upload);
  }

  cancel() {
    this.clipzService.cancel(this.upload);
  }
}
