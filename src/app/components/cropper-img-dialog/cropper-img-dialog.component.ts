import { Component, ChangeDetectionStrategy, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { StyleRenderer, WithStyles, lyl, ThemeRef, ThemeVariables } from '@alyle/ui';
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog';
import {
  STYLES as CROPPER_STYLES,
  LyImageCropper,
  ImgCropperConfig,
  ImgCropperEvent,
  ImgCropperErrorEvent
} from '@alyle/ui/image-cropper';

const STYLES = (_theme: ThemeVariables, ref: ThemeRef) => {
  ref.renderStyleSheet(CROPPER_STYLES);
  const cropper = ref.selectorsOf(CROPPER_STYLES);

  return {
    root: lyl `{
      ${cropper.root} {
        max-width: 420px
        height: 320px
      }
    }`
  };
};

@Component({
  selector: 'app-cropper-img-dialog',
  templateUrl: './cropper-img-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ StyleRenderer ],
  styleUrls: ['./cropper-img-dialog.component.scss']

})
export class CropperImgDialogComponent implements WithStyles, AfterViewInit {

  constructor(
    @Inject(LY_DIALOG_DATA) private event: Event,
    readonly sRenderer: StyleRenderer,
    public dialogRef: LyDialogRef
  ) { }


  readonly classes = this.sRenderer.renderSheet(STYLES, 'root');
  ready: boolean;
  scale: number;
  minScale: number;
  @ViewChild(LyImageCropper, { static: true }) cropper: LyImageCropper;
  myConfig: ImgCropperConfig = {
    width: 220,
    height: 220,
    //type: 'image/jpeg',
    keepAspectRatio: true,
    round: true,
    output: {
      width: 200,
      height: 200,
    },
    resizableArea: false
  };

  ngAfterViewInit() {
    // Load image when dialog animation has finished
    this.dialogRef.afterOpened.subscribe(() => {
      this.cropper.selectInputEvent(this.event);
    });
  }

  onError(e: ImgCropperErrorEvent) {
    console.warn(`'${e.name}' is not a valid image`, e);
    // Close the dialog if it fails
    this.dialogRef.close();
  }


}
