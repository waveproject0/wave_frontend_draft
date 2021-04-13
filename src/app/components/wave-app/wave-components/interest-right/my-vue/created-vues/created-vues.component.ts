import { LINK_PREVIEW, INTEREST_KEYWORD, PAGE_INFO } from './../../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { MY_VUE } from './../../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../../_services/graphql.service';
import { AppDataShareService } from './../../../../../../_services/app-data-share.service';
import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { abbreviateNumber, timeSince } from 'src/app/_helpers/functions.utils';
import { NgxMasonryOptions } from 'ngx-masonry';

@Component({
  selector: 'app-created-vues',
  templateUrl: './created-vues.component.html',
  styleUrls: ['./created-vues.component.scss']
})
export class CreatedVuesComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private graphqlService:GraphqlService
    ) { }

  @Output() createVueRequest = new EventEmitter();
  @Output() myVueEmptyEvent = new EventEmitter();

  loading = true;
  masonryLoading = true;
  appContainerHeight:string;
  myVueEmpty:boolean;
  myVueError = false;
  myVuefetchLength = 5;
  myVueDataArray:LINK_PREVIEW[] = [];
  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueFeedWidth:number;

  public masonryOption: NgxMasonryOptions = {
    gutter: 70,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';

    if (this.appDataShareService.myVueArray.length != 0){
      this.appDataShareService.myVuePageInfo ? this.fetchMore = this.appDataShareService.myVuePageInfo.hasNextPage : null;
      this.myVueDataArray = this.appDataShareService.myVueArray;
      this.loading = false;
      this.myVueEmpty = false;
      this.myVueEmptyEvent.emit(false);
    }
    else{
      this.getMyVue();
    }
  }

  getMyVue(fetchMore=false){
    if (!fetchMore){
      this.myVueError = false;
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
          'first':this.myVuefetchLength,
          'after':this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:MY_VUE, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.allMyVue === null || result.data.allMyVue.edges.length === 0){
              if (!fetchMore){
                this.myVueEmpty = true;
                this.myVueEmptyEvent.emit(true);
                this.loading = false;
              }
              else{
                const mutationArrgs = {
                  'first':this.myVuefetchLength,
                  'before':this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor : ""
                }
                this.graphqlService.graphqlQuery({query:MY_VUE, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
                .subscribe((result:any) =>{
                  if (result.data.allMyVue === null || result.data.allMyVue.edges.length === 0){
                    this.fetchMoreLoading = false;
                    this.fetchMoreError = true;
                  }
                  else{
                    this.appDataShareService.myVueArray = [];
                    this.createMyVueDataArray(result.data.allMyVue.pageInfo, result.data.allMyVue.edges);
                  }
                });
              }
            }
            else{
              this.createMyVueDataArray(result.data.allMyVue.pageInfo, result.data.allMyVue.edges);
            }
          },
          error =>{
            if (!fetchMore){
              this.loading = false;
              this.myVueError = true;
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
          this.myVueError = true;
        }
        else{
          this.fetchMoreLoading = false;
          this.fetchMoreError = true;
        }
      }
    })();
  }

  createMyVueDataArray(pageInfo:PAGE_INFO, allMyVueArray){
    this.appDataShareService.myVuePageInfo = pageInfo;
    this.fetchMore = this.appDataShareService.myVuePageInfo.hasNextPage;

    allMyVueArray.forEach(element => {
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      let vueOpenedCount = 0;
      let vueSavedCount = 0;
      element.node.vueinterestSet.edges.forEach(interest => {
        vue_interest_tags.push({
          id: interest.node.interestKeyword.id,
          name: interest.node.interestKeyword.word,
          selected: false
        });
      });
      if (element.node.vuestudentsSet.edges.length != 0){
        element.node.vuestudentsSet.edges.forEach(studentCount => {
          studentCount.node.opened ? vueOpenedCount +=1 : null;
          studentCount.node.saved ? vueSavedCount +=1 : null;
        });
      }
      this.appDataShareService.myVueArray.push({
        id: element.node.id,
        image: element.node.image,
        title: element.node.title,
        truncated_title: element.node.truncatedTitle,
        url: element.node.url,
        domain_name: element.node.domainName,
        site_name: element.node.siteName,
        description: element.node.description,
        interest_keyword: vue_interest_tags,
        conversation_disabled: element.node.conversationDisabled,
        created: element.node.create,
        friendly_date: timeSince(new Date(element.node.create)),
        viewed: abbreviateNumber(vueOpenedCount),
        saved: abbreviateNumber(vueSavedCount),
        cursor: element.cursor
      });
    });
    this.myVueDataArray = this.appDataShareService.myVueArray;
    this.loading = false;
    this.fetchMoreLoading = false;
    this.myVueEmpty = false;
    this.myVueEmptyEvent.emit(false);
  };

  createVue(){
    this.createVueRequest.emit(true);
  }

  updateVueLayout(id){
    const objIndex = this.myVueDataArray.findIndex(obj => obj.id === id);
    this.myVueDataArray.splice(objIndex, 1);
    this.appDataShareService.myVueArray = this.myVueDataArray;

    if (this.appDataShareService.myVueArray.length == 0){
      this.myVueEmptyEvent.emit(true);
      this.myVueEmpty = true;
    }
    else{
      this.myVueEmptyEvent.emit(false)
    }
  }

  ngOnDestroy(){

  }

}
