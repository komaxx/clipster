import { Component, Input } from '@angular/core';
import { ClipUpload } from '../clip-upload';
import { ClipzService } from '../clipz.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Input()
  upload: ClipUpload;

  constructor(private clipzService: ClipzService) {
  }

  cancel() {
    this.clipzService.cancel(this.upload);
  }

  acknowledge() {
    this.clipzService.acknowledge(this.upload);
  }
}
