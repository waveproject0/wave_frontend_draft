import { LINK_PREVIEW } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { VUE_SAVED } from './../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { Component, OnInit } from '@angular/core';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';

@Component({
  selector: 'app-vue-save',
  templateUrl: './vue-save.component.html',
  styleUrls: ['./vue-save.component.scss']
})
export class VueSaveComponent implements OnInit {

  constructor(
    private appDataShareService: AppDataShareService,
    private graphqlService: GraphqlService
    ) { }

  appContainerHeight:string;
  appRightContainerWidth:string;
  vue_backgorund_url:string;

  loading = true;
  vueError = false;
  vueEmpty:boolean;
  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;
  vueFeedLength = 30;
  vueSaveArray:LINK_PREVIEW[] = [];

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';
    this.appRightContainerWidth = (this.appDataShareService.appRightContainerWidth - 20) + 'px';
    this.vue_backgorund_url = this.appDataShareService.vue_background;

    if (this.appDataShareService.vueSaveArray.length != 0){
      this.appDataShareService.vueSavePageInfo ? this.fetchMore = this.appDataShareService.vueSavePageInfo.hasNextPage : null;
      this.vueSaveArray = this.appDataShareService.vueSaveArray;
      this.loading = false;
      this.vueEmpty = false;
    }
    else{
      this.getVueFeed();
    }
  }

  getVueFeed(fetchMore=false){
    if (!fetchMore){
      this.vueError = false;
      this.loading = true;
    }
    else{
      this.fetchMoreLoading = true;
      this.fetchMoreError = false;
    }

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'first':this.vueFeedLength,
          'after':this.appDataShareService.vueSavePageInfo ? this.appDataShareService.vueSavePageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:VUE_SAVED, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.allMyVue === null || result.data.allMyVue.edges.length === 0){
              if (!fetchMore){
                this.vueEmpty = true;
                this.loading = false;
              }
              else{
                this.fetchMoreLoading = false;
                this.fetchMoreError = true;
              }
            }
            else{
              //this.createMyVueDataArray(result.data.allMyVue.pageInfo, result.data.allMyVue.edges);
            }
          },
          error =>{
            if (!fetchMore){
              this.loading = false;
              this.vueError = true;
            }
            else{
              this.fetchMoreLoading = false;
              this.fetchMoreError = true;
            }
          }
        )
      }
      else{
        if (!fetchMore){
          this.loading = false;
          this.vueError = true;
        }
        else{
          this.fetchMoreLoading = false;
          this.fetchMoreError = true;
        }
      }
    })();
  }

}
