import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LyDialog } from '@alyle/ui/dialog';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { CropperImgDialogComponent } from './../cropper-img-dialog/cropper-img-dialog.component';
import { dataURLtoFile } from 'src/app/_helpers/functions.utils';


@Component({
  selector: 'app-image-upload-widget',
  templateUrl: './image-upload-widget.component.html',
  styleUrls: ['./image-upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadWidgetComponent implements OnInit {

  constructor(private _dialog: LyDialog, private _cd: ChangeDetectorRef) { }

  @Input() smallWidget = true;
  @Input() imgToCrop = true;
  @Input() borderRadius:string;
  @Input() imgURL:any;
  @Output('croppedImg') imgFile = new EventEmitter();

  imgPickOverlay = false;



  openCropperDialog(event: Event, files) {
    if(this.imgToCrop){
      this._dialog.open<CropperImgDialogComponent, Event>(CropperImgDialogComponent, {
        data: event,
        width: 420,
        disableClose: true
      }).afterClosed.subscribe((result?: ImgCropperEvent) => {
        if (result) {
          this.imgURL = result.dataURL;
          this.imgFile.emit(dataURLtoFile(this.imgURL, result.name));
          this._cd.markForCheck();
        }
      });
    }
    else{
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
        this.imgFile.emit(dataURLtoFile(this.imgURL, files[0].name));
      }
    }

  }


  ngOnInit(): void {
  }

}
