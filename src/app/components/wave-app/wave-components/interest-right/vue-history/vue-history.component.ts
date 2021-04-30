import { LINK_PREVIEW } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { VUE_HISTORY } from './../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { Component, OnInit } from '@angular/core';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';

@Component({
  selector: 'app-vue-history',
  templateUrl: './vue-history.component.html',
  styleUrls: ['./vue-history.component.scss']
})
export class VueHistoryComponent implements OnInit {

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
  vueHistoryArray:LINK_PREVIEW[] = [];

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';
    this.appRightContainerWidth = (this.appDataShareService.appRightContainerWidth - 20) + 'px';
    this.vue_backgorund_url = this.appDataShareService.vue_background;

    if (this.appDataShareService.vueHistoryArray.length != 0){
      this.appDataShareService.vueHistoryPageInfo ? this.fetchMore = this.appDataShareService.vueHistoryPageInfo.hasNextPage : null;
      this.vueHistoryArray = this.appDataShareService.vueHistoryArray;
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
          'after':this.appDataShareService.vueHistoryPageInfo ? this.appDataShareService.vueHistoryPageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:VUE_HISTORY, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
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
