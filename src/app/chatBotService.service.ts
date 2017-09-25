import { Injectable, OnInit } from '@angular/core';
import { Headers, RequestOptions ,Http, Response ,ResponseOptions} from '@angular/http';
import { ChatConnectBody } from './result.model';
import 'rxjs/Rx'
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class ChatBotService {

	private baseUrl: string= "https://directline.botframework.com/v3/directline/conversations";
  private serect="RiXqDt97Z8g.cwA.u4M.8EV8JSJn0ip62kmfUGh4eYGBPdhfgyHqqpf_MxNTZ7k";  

	constructor(private http: Http) {
	}


  ngOnInit () {
  }


	getAuthorization() : Observable<ChatConnectBody> 
  {

    let headers = new Headers({ 'Authorization':'Bearer '+this.serect});

    let options = new RequestOptions({ headers: headers });

    let url = this.baseUrl;
    console.log(url);
    return this.http.post(url, null ,options)
                .map(this.extractData)
                .finally(() => true)
                .catch(this.handleError);


	}

  sendMessage(sendRequest,conversationId) : Observable<ChatConnectBody> 
  {
    let body = JSON.stringify(sendRequest);

    let headers = new Headers({ 'Authorization':'Bearer '+this.serect});
    headers.append('Content-Type','application/json');

    let options = new RequestOptions({ headers: headers });
    let url = `${this.baseUrl}/${conversationId}/activities`;
    return this.http.post(url, body, options)
                 .map(this.extractData)
                 .catch(this.handleError);

  }


	private extractData(res: Response) {

    let body = res.json();
    return body || { };
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message

    let errMsg = (error.message) ? error.message :
    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(error);
  }


}

