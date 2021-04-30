import { UserDataService } from './../../../../../_services/user-data.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { timeSince } from 'src/app/_helpers/functions.utils';
import { PAGE_INFO, LINK_PREVIEW, INTEREST_KEYWORD, USER_PREFERENCE } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { VUE_FEED } from './../../../../../_helpers/graphql.query';
import { Component, OnInit } from '@angular/core';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';
import { GraphqlService } from './../../../../../_services/graphql.service';

@Component({
  selector: 'app-vue-feed',
  templateUrl: './vue-feed.component.html',
  styleUrls: ['./vue-feed.component.scss']
})
export class VueFeedComponent implements OnInit {

  constructor(
    private appDataShareService: AppDataShareService,
    private graphqlService: GraphqlService,
    private userDataService: UserDataService
    ) { }

  appContainerHeight:string;
  appRightContainerWidth:string;
  vue_backgorund_url:string;
  userPreference:USER_PREFERENCE;

  loading = true;

  vueError = false;
  vueEmpty:boolean;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueFeedLength = 30;
  vueFeedArray:LINK_PREVIEW[] = [];

  masonryLoading = true;

  masonryOption: NgxMasonryOptions = {
    gutter: 70,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';
    this.appRightContainerWidth = (this.appDataShareService.appRightContainerWidth - 20) + 'px';
    this.vue_backgorund_url = this.appDataShareService.vue_background;

    if (this.appDataShareService.vueFeedArray.length != 0){
      this.appDataShareService.vueFeedPageInfo ? this.fetchMore = this.appDataShareService.vueFeedPageInfo.hasNextPage : null;
      this.vueFeedArray = this.appDataShareService.vueFeedArray;
      this.loading = false;
      this.vueEmpty = false;
    }
    else{
      const user_obj = this.userDataService.getItem({userObject:true}).userObject;
      this.userPreference = {
        country: user_obj.location.country_name,
        region: user_obj.location.region,
        institution:user_obj.institution === null ? null : {uid: user_obj.institution.uid, name: user_obj.institution.name},
        locationPreference: user_obj.locationPreference,
        agePreference: user_obj.agePreference,
        conversationPoints: user_obj.conversationPoints,
        age: user_obj.age
      }
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
          'after':this.appDataShareService.vueFeedPageInfo ? this.appDataShareService.vueFeedPageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:VUE_FEED, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.vueFeed === null || result.data.vueFeed.edges.length === 0){
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
              this.createVueArray(result.data.vueFeed.pageInfo, result.data.vueFeed.edges);
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

  createVueArray(pageInfo:PAGE_INFO, vueFeed){
    this.appDataShareService.vueFeedPageInfo = pageInfo;
    this.fetchMore = this.appDataShareService.vueFeedPageInfo.hasNextPage;

    vueFeed.forEach(element => {
      let conversation_disabled = false;
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      const author_preference:USER_PREFERENCE = {
        country: element.node.vue.country,
        region: element.node.vue.region,
        institution: {uid: element.node.vue.institution},
        locationPreference: element.node.vue.locationPreference,
        conversationPoints: element.node.vue.conversationPoint,
        agePreference: element.node.vue.agePreference,
        age: element.node.vue.age
      }

      element.node.vue.vueinterestSet.edges.forEach(interest => {
        vue_interest_tags.push({
          id: interest.node.interestKeyword.id,
          name: interest.node.interestKeyword.word
        });
      });

      if (element.node.vue.newConversationDisabled || element.node.vue.autoConversationDisabled){
        conversation_disabled = true;
      }
      else if (element.node.vue.conversationDisabled){
        conversation_disabled = true;
      }
      else{
        conversation_disabled = this.isVueConverseDisable(this.userPreference, author_preference);
      }

      this.appDataShareService.vueFeedArray.push({
        id: element.node.vue.id,
        image: element.node.vue.image,
        truncated_title: element.node.vue.truncatedTitle,
        url: element.node.url,
        domain_name: element.node.vue.domainName,
        site_name: element.node.vue.siteName,
        description: element.node.vue.description,
        interest_keyword: vue_interest_tags,
        created: element.node.vue.create,
        friendly_date: timeSince(new Date(element.node.vue.create)),
        location: this.locationName(this.userPreference, author_preference),
        age: element.node.vue.age,
        conversation_disabled: conversation_disabled,
      });
    });

    this.vueFeedArray = this.appDataShareService.vueFeedArray;
    console.log(this.vueFeedArray);
    this.loading = false;
    this.fetchMoreLoading = false;
    this.vueEmpty = false;
  }

  isVueConverseDisable(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE): boolean{
    let locationCheckPassed = false
    let ageCheckPassed = false
    let conversationCheckPassed = false

    let user_conversation_point:number;
    let author_conversation_point:number;

    if (author_preference.locationPreference === 'country'){
      author_preference.country === user_preference.country ? locationCheckPassed = true : null;
    }
    else if (author_preference.locationPreference === 'region'){
      author_preference.region === user_preference.region && author_preference.country === user_preference.country ? locationCheckPassed = true : null;
    }
    else if (author_preference.locationPreference === 'institution'){
      author_preference.institution.uid === user_preference.institution.uid ? locationCheckPassed = true : null;
    }

    if (
        user_preference.age >= (author_preference.age-author_preference.agePreference) &&
        user_preference.age <= (author_preference.age+author_preference.agePreference)
      ){
        ageCheckPassed = true;
    }

    if (user_preference.conversationPoints >= 90){
      user_conversation_point = 100;
    }
    else{
      user_conversation_point = user_preference.conversationPoints + 10;
    }

    if (author_preference.conversationPoints >= 90){
      author_conversation_point = 100;
    }
    else{
      author_conversation_point = author_preference.conversationPoints + 10;
    }

    if (Math.abs(author_conversation_point-user_conversation_point) <= 10){
      conversationCheckPassed = true;
    }

    if (locationCheckPassed && ageCheckPassed && conversationCheckPassed){
      return true;
    }
    else{
      return false;
    }
  }

  locationName(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE){
    if (user_preference.locationPreference === 'global'){
      return author_preference.country
    }
    else if (user_preference.locationPreference === 'country' || user_preference.locationPreference === 'region'){
      return author_preference.region
    }
    else{
      return user_preference.institution.name
    }
  }

}
