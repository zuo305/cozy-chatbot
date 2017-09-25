import { Component ,ViewChild , ElementRef} from '@angular/core';
import { ChatBotService } from './chatBotService.service';
import { Http} from '@angular/http';
import { ChatConnectBody ,SendRequest ,ChatResponse,ReceiveMessage} from './result.model';
import { SpeechRecognitionService } from './speechRecognition.service';
import { DateFormatService } from './date-format.service';

class HotelObject {
  hotelName : string;
  hotelRate : string;
  hotelImage : string;
  hotelPrice : number;
}

export class Message
{
  public text = '';
  public message_side = '';
  public watermark : number;
  public message_type = '';
  public hotelObjects = [];
   constructor(text, message_side,watermark,message_type='normal',hotelObjects= []) {
 	    this.text = text;
 	    this.message_side = message_side;
      this.watermark = watermark;
      this.message_type = message_type;
      this.hotelObjects= hotelObjects;
 	}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[ChatBotService,SpeechRecognitionService,DateFormatService]
})
export class AppComponent {
  title = 'app';
  public inputText = '';
  public messageArray = [];
  public chatConnectBody : ChatConnectBody;
  public recognition;

  public templateArray = ["2017-10-20 - 2017-10-21 悉尼 2间 早餐无所谓，赶紧，感激！","悉尼","2017-10-30 - 2017-11-02"];
  public cityList = ["悉尼","墨尔本","布里斯班","悉尼","墨尔本","布里斯班","悉尼","墨尔本","布里斯班"];

  public showTemplate = false;

  public supportSpeech = true;

  public mobile = false;

  private testText = `{
      "type": "message",
      "id": "WmRwXaUpuBErQRf1Oghfs|0000015",
      "timestamp": "2017-09-25T06:54:24.9966999Z",
      "localTimestamp": "2017-09-25T06:54:24.255+00:00",
      "channelId": "webchat",
      "from": {
        "id": "cozitrip-chatbot_Igsd3FwPIaw",
        "name": "cozitrip-chatbot"
      },
      "conversation": {
        "id": "WmRwXaUpuBErQRf1Oghfs"
      },
      "attachmentLayout": "carousel",
      "inputHint": "expectingInput",
      "attachments": [
        {
          "contentType": "application/vnd.microsoft.card.hero",
          "content": {
            "title": "悉尼香格里拉酒店",
            "subtitle": "5星级",
            "text": "每晚价格从 AUD 330起",
            "images": [
              {
                "url": "http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/SHS1CS-112117.png"
              }
            ],
            "buttons": [
              {
                "type": "postBack",
                "title": "选择"
              }
            ]
          }
        },
        {
          "contentType": "application/vnd.microsoft.card.hero",
          "content": {
            "title": "悉尼丽笙世嘉酒店",
            "subtitle": "5星级",
            "text": "每晚价格从 AUD 386起",
            "images": [
              {
                "url": "http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/RBPH2O-8382.jpg"
              }
            ],
            "buttons": [
              {
                "type": "postBack",
                "title": "选择"
              }
            ]
          }
        },
        {
          "contentType": "application/vnd.microsoft.card.hero",
          "content": {
            "title": "喜来登公园酒店",
            "subtitle": "5星级",
            "text": "每晚价格从 AUD 367起",
            "images": [
              {
                "url": "http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/SOTP1E-9058.jpg"
              }
            ],
            "buttons": [
              {
                "type": "postBack",
                "title": "选择"
              }
            ]
          }
        },
        {
          "contentType": "application/vnd.microsoft.card.hero",
          "content": {
            "title": "索菲特悉尼温特沃什酒店",
            "subtitle": "5星级",
            "text": "每晚价格从 AUD 330起",
            "images": [
              {
                "url": "http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/SSW6PS-8945.jpg"
              }
            ],
            "buttons": [
              {
                "type": "postBack",
                "title": "选择"
              }
            ]
          }
        },
        {
          "contentType": "application/vnd.microsoft.card.hero",
          "content": {
            "title": "悉尼铂尔曼海德公园酒店",
            "subtitle": "5星级",
            "text": "每晚价格从 AUD 280起",
            "images": [
              {
                "url": "http://images-hk.cozitrip.com/b2b/hotels/AU/SYD/PSHP3C-8138.jpg"
              }
            ],
            "buttons": [
              {
                "type": "postBack",
                "title": "选择"
              }
            ]
          }
        }
      ],
      "replyToId": "WmRwXaUpuBErQRf1Oghfs|0000012"
    }`;


  @ViewChild('scrollMe') private myScrollContainer: ElementRef;


  public _bsRangeValue: any = [];

 
  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
    console.log(this._bsRangeValue);

    let arrival = this.dateFormatService.getCorrectDateString(this._bsRangeValue[0]);
    let departure = this.dateFormatService.getCorrectDateString(this._bsRangeValue[1]);
    let result = " "+ arrival + " - " + departure + " ";
//    this.inputText += result;
    this.sendMessageClick(false,result);
    this.showTemplate = false;
  }
 
  getHeight()
  {
    if(document.documentElement.clientWidth>800)
    {
      return 347;
    }
    let windowHeight = document.documentElement.clientHeight;
    return windowHeight - 150;
  }

  constructor(private dateFormatService :DateFormatService,
    private chatBotService : ChatBotService,private speechRecognitionService : SpeechRecognitionService)
  {
    let today = new Date();
//    this._bsRangeValue = [this.dateFormatService.addDays(today,1),this.dateFormatService.addDays(today,2)]

    if (!('webkitSpeechRecognition' in window)) {
      this.supportSpeech = false;
    }

    if(this.detectMobile()==true)
    {
      this.mobile = true;
    }


    this.chatBotService.getAuthorization().timeout(120000).subscribe(result =>  { 
        console.log(result);
        this.chatConnectBody= result;
        },
         err => {
        }
    );

    this.activateSpeechSearchMovie();
  }

  detectMobile() {
    if( navigator.userAgent.match(/Android/i)
     || navigator.userAgent.match(/webOS/i)
     || navigator.userAgent.match(/iPhone/i)
     || navigator.userAgent.match(/iPad/i)
     || navigator.userAgent.match(/iPod/i)
     || navigator.userAgent.match(/BlackBerry/i)
     || navigator.userAgent.match(/Windows Phone/i)
     ){
        return true;
      }
     else {
        return false;
      }
  };


   activateSpeechSearchMovie(): void {
//        this.showSearchButton = false;
      if(this.supportSpeech==false)
        return;

        this.speechRecognitionService.record()
            .subscribe(
            //listener
            (value) => {
              this.inputText = value;
              this.sendMessageClick();
//                this.speechData = value;
                console.log(value);
            },
            //errror
            (err) => {
                console.log(err);
                if (err.error == "no-speech") {
                    console.log("--restatring service--");
                    this.activateSpeechSearchMovie();
                }
            },
            //completion
            () => {
//                this.showSearchButton = true;
                console.log("--complete--");
                this.activateSpeechSearchMovie();
            });
    }

  // createSpeechInput() {

  //   if (!('webkitSpeechRecognition' in window)) {

  //   } else {
  //       let that = this;
  //       this.recognition = new webkitSpeechRecognition();
  //       this.recognition.onstart = function() {}
  //       this.recognition.onresult = function(event) { 
  //       var interim_transcript = '';
  //       // for (var i = event.resultIndex; i < event.results.length; ++i) {
  //       //    if (event.results[i].isFinal) {
  //       //      this.inputText += event.results[i][0].transcript;
  //       //    } else {
  //       //      this.inputText += event.results[i][0].transcript;
  //       //    }
  //       // }
  //       var last = event.results.length - 1;
  //       that.inputText = event.results[last][0].transcript;
  //       that.sendMessageClick();
  //       console.log(event.results[last][0].transcript);
  //       console.log('Confidence: ' + event.results[0][0].confidence);
  //     }
  //     this.recognition.onerror = function(event) {}
  //     this.recognition.onend = function() {}
  //   }

  // }

  receiveMessage() {    
    var msg = {
   };
    let that = this;
    var exampleSocket = new WebSocket(this.chatConnectBody.streamUrl );
//    exampleSocket.send(JSON.stringify(msg));
    exampleSocket.onopen = function (event) {
    exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
    };  

    exampleSocket.onerror = function (event) {
      console.log(event);      
    }

    exampleSocket.onmessage = function (event) {
     console.log(event.data);
     if(event.data && event.data.length>0)
     {
       let receiveMessage : ReceiveMessage = JSON.parse(event.data);
       if(receiveMessage.activities && receiveMessage.activities.length>0)
       {
         let response = JSON.parse(that.testText);//receiveMessage.activities[0];
         let watermark = receiveMessage.watermark;
         var gotIt = false;

         for(var i=0;i<that.messageArray.length;i++)
         {
           if(watermark==that.messageArray[i].watermark)
           {
             gotIt = true;
             break;
           }
         }

         if(gotIt==false)
         {
           if(response.from.id=='user1')
           {

           }
           else
           {
               that.activateSpeechSearchMovie();
               if(response.text && response.text.length>0)
               {
                 var message = new Message(response.text,'left',watermark);
                 that.messageArray.push(message);
               }
               else if(response.attachments && response.attachments.length>0)
               {
                 var message = new Message("亲，帮您找到这些房间",'left',watermark);
                 that.messageArray.push(message);

                 var message = new Message("",'left',watermark,"list",response.attachments);
                 that.messageArray.push(message);

               }

               setTimeout(function() {
               try {
                       that.myScrollContainer.nativeElement.scrollTop = that.myScrollContainer.nativeElement.scrollHeight;
                   } catch(err) { }    
               }, 30);
           }
         }
       }
     }
    }
  }

  messageTemplate()
  {
    this.showTemplate = !this.showTemplate;
  }

  selectTemplate(index : number) 
  {
    this.inputText = this.templateArray[index];
    this.showTemplate = false;
  }

  buynow()
  {
    alert("Coming Soon!");
  }

  selectCity(index)
  {
      this.sendMessageClick(false,this.cityList[index]);
      this.showTemplate = false;

//    this.inputText += this.cityList[index];
  }

  sendMessageClick(clear = true,text='') {

    let sendText = '';

    if(clear == true)
        sendText = this.inputText;
    else
        sendText = text;

    if(sendText.length<=0)
      return;

  	console.log(sendText);
  	var message = new Message(sendText,'right',-1);
  	this.messageArray.push(message);

    let sendRequest = new SendRequest();
    sendRequest.type = 'message';
    sendRequest.from = {'id': 'user1'};

    sendRequest.text = sendText;

    if(clear==true)
    {
      this.inputText = '';
    }
    else
    {
    }

    this.chatBotService.sendMessage(sendRequest,this.chatConnectBody.conversationId).timeout(120000).subscribe(result =>  { 
        console.log(result);
        },
         err => {
        }
      );       

    this.receiveMessage();

    let that = this;
     setTimeout(function() {
     try {
             that.myScrollContainer.nativeElement.scrollTop = that.myScrollContainer.nativeElement.scrollHeight;
         } catch(err) { }    
     }, 30);

  };
}
