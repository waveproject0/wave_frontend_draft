import { NgModule } from '@angular/core';
import { LyImageCropperModule } from '@alyle/ui/image-cropper';
import { LyDialogModule } from '@alyle/ui/dialog';

const lyuiComponents = [
    LyImageCropperModule,
    LyDialogModule,
];


@NgModule({
    imports: [lyuiComponents],
    exports: [lyuiComponents]
  })
  export class LyuiModule { }