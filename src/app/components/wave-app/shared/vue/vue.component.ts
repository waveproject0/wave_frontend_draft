import { timeSince } from 'src/app/_helpers/functions.utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VUE_CONVERSATION_UPDATE, VUE_PUBLISH, VUE_DESCRIPTION_UPDATE, VUE_DELETE } from './../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../_services/graphql.service';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { INTEREST_KEYWORD } from './../../../../_helpers/constents';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Component, OnInit, Input, ViewChild, NgZone, OnDestroy, Output, EventEmitter } from '@angular/core';
import { LINK_PREVIEW } from 'src/app/_helpers/constents';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vue',
  templateUrl: './vue.component.html',
  styleUrls: ['./vue.component.scss']
})
export class VueComponent implements OnInit, OnDestroy {

  constructor(
    private _ngZone: NgZone,
    private appDataShareService:AppDataShareService,
    private graphqlService:GraphqlService,
    private snackBar: MatSnackBar
    ) { }

  @Input() linkPreview:LINK_PREVIEW;
  @Input() createVue = false;
  @Input() editVue = false;
  @Output() vueSubmited = new EventEmitter();
  @Output() vueDeleted = new EventEmitter();

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  img_display = true;
  vueForm: FormGroup;
  vueSubmitStatus = false;
  vueSubmitError = false;
  vueDeleteLoading = false;

  editVueDescription = false;
  editVueConversation = false;

  currentSelectedInterest:INTEREST_KEYWORD[] = [];
  selectedInterestUnsub: Subscription;

  disableNewConversation = false;

  imgError(error){
    this.img_display = false;
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }


  vueSubmit(){
    this.linkPreview.description = this.vueForm.get('description').value.replace(/(\r\n|\n|\r)/gm, "");
    this.linkPreview.interest_keyword = this.currentSelectedInterest;
    this.linkPreview.conversation_disabled = this.disableNewConversation;
    this.linkPreview.viewed = 0;
    this.linkPreview.saved = 0;
    this.linkPreview.created = new Date().toString();
    this.linkPreview.friendly_date = timeSince(new Date());
    this.linkPreview.cursor = "";

    (async () =>{
      this.vueSubmitStatus = null;
      this.vueSubmitError = false;
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueJson': JSON.stringify(this.linkPreview)
        }

        this.graphqlService.graphqlMutation(VUE_PUBLISH, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data.vuePublish.result){
              this.linkPreview.id = result.data.vuePublish.vue.id;
              this.appDataShareService.myVueArray.unshift(this.linkPreview);
              this.vueSubmited.emit(true);
            }
            else{
              this.vueSubmitStatus = false;
              this.vueSubmitError = true;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.vueSubmitStatus = false;
            this.vueSubmitError = true;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        )
      }
      else{
        this.vueSubmitStatus = false;
        this.vueSubmitError = true;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();

  }

  createVueForm(description=null){
    this.vueForm = new FormGroup({
      'description': new FormControl(description, Validators.required)
    });
  }

  ngOnInit(): void {
    if (this.createVue){
      this.createVueForm();
      this.appDataShareService.currentSelectedInterestArray.forEach(element =>{
        if (element.selected){
          this.currentSelectedInterest.push(element);
        }
      });
      this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest()
      .subscribe((interest:INTEREST_KEYWORD) =>{
        if (interest.selected){
          this.currentSelectedInterest.push(interest);
        }
        else{
          const objIndex = this.currentSelectedInterest.findIndex(obj => obj.id === interest.id);
          if (objIndex > -1) {
            this.currentSelectedInterest.splice(objIndex, 1);
          }
        }
      });
    }
    else{

    }
  }

  changeConversationSetting(){
    if (this.createVue){
      this.disableNewConversation = !this.disableNewConversation;
    }
  }

  vueConversationUpdate(){
    this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueID': this.linkPreview.id
        }
        this.graphqlService.graphqlMutation(VUE_CONVERSATION_UPDATE, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data.vueConversationUpdate.result){
              const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.linkPreview.id);
              this.appDataShareService.myVueArray[objIndex].conversation_disabled = this.linkPreview.conversation_disabled;
              console.log(this.appDataShareService.myVueArray[objIndex]);
            }
            else{
              this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
      else{
        this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();
  }

  vueDescriptionUpdate(){
    const vueDescription = this.linkPreview.description;
    this.linkPreview.description = this.vueForm.get('description').value;
    this.editVueDescription = false;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueId': this.linkPreview.id,
          'description': this.vueForm.get('description').value
        }

        this.graphqlService.graphqlMutation(VUE_DESCRIPTION_UPDATE, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data.vueDescriptionUpdate.result){
              const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.linkPreview.id);
              this.appDataShareService.myVueArray[objIndex].description = this.linkPreview.description;
            }
            else{
              this.linkPreview.description = vueDescription;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.linkPreview.description = vueDescription;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
      else{
        this.linkPreview.description = vueDescription;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();
  }


  vueDelete(){
    this.appDataShareService.alertInput.next("Do you want to Delete this Vue? This will be a permanent change!");
    this.appDataShareService.alertResponse().pipe(take(1))
      .subscribe((response:boolean) =>{
        if (response === true){
          this.vueDeleteLoading = true;
          (async () =>{
            const tokenStatus = await this.graphqlService.isTokenValid();
            if (tokenStatus){
              const mutationArrgs = {
                'vueId': this.linkPreview.id
              }
              this.graphqlService.graphqlMutation(VUE_DELETE, mutationArrgs).pipe(take(1))
              .subscribe(
                (result:any) =>{
                  if (result.data.vueDelete.result){
                    const lastIndex = this.appDataShareService.myVueArray.length -1;
                    const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.linkPreview.id);
                    if (this.appDataShareService.myVueArray.length == 1){
                      this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor = "" : null;
                    }
                    else if (objIndex === lastIndex){
                      this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor = this.appDataShareService.myVueArray[lastIndex - 1].cursor : null;
                    }
                    this.vueDeleted.emit(this.linkPreview.id);
                  }
                  else if(!result.data.vueDelete.result){
                    this.vueDeleteLoading = false;
                    this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                  }
                },
                error =>{
                  this.vueDeleteLoading = false;
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                }
              );
            }
            else{
              this.vueDeleteLoading = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          })();

        }
      });
  }

  ngOnDestroy(){
    if (this.selectedInterestUnsub) this.selectedInterestUnsub.unsubscribe();
  }

}
