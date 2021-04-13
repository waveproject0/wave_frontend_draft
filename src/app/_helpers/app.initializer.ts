import { TRUSTED_DEVICE } from './constents';
import { GraphqlService } from './../_services/graphql.service';


export function appInitializer(graphqlService: GraphqlService){
    return () =>{
      if (localStorage.getItem(TRUSTED_DEVICE)){
        graphqlService.initialTokenRefresh = true;
        graphqlService.getNewToken();
      }
    }
}
