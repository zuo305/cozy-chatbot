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

class textObject {
  text : string;
  type : number; //0 normal 1 city 2 date range 3 date

   constructor(text, type) {
       this.text = text;
       this.type = type;
   }  
}

export class Message
{
  public text = '';
  public textArray = [];
  public message_side = '';
  public watermark : number;
  public message_type = '';
  public hotelObjects = [];
   constructor(text, message_side,watermark,message_type='normal',hotelObjects= [],textArray=[]) {
 	    this.text = text;
 	    this.message_side = message_side;
      this.watermark = watermark;
      this.message_type = message_type;
      this.hotelObjects= hotelObjects;
      this.textArray= textArray;
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

  public minDate = new Date();

  public templateArray = ["2017-10-20 - 2017-10-21 悉尼 2间 早餐无所谓，赶紧，感激！","悉尼","2017-10-30 - 2017-11-02"];
  public cityListAU = ["悉尼","墨尔本","布里斯班","黄金海岸","凯恩斯","珀斯","阿德莱德","堪培拉","霍巴特","达尔文","朗塞斯顿","艾丽丝泉","汉密尔顿岛","卡尔巴里"];
  public cityListNZ = ["奥克兰","皇后镇","基督城","特卡波湖","罗托鲁瓦","但尼丁","惠灵顿","奥冯鲁","格雷茅斯","福克斯冰川","凯库拉","瓦纳卡湖","库克山","蒂阿瑙"];

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

  private windowHeight = 0;
 
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

  windowSize(event)
  {
    let height = event.target.innerHeight; // window height
    if(this.windowHeight != height)
    {
      this.windowHeight = height;
      this.getHeight();

      setTimeout(function() {
               try {
                       this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
                   } catch(err) { }    
               }, 30);      
    }
  }
 
  getHeight()
  {
    if(document.documentElement.clientWidth>800)
    {
      return 347+65;
    }
    let windowHeight = document.documentElement.clientHeight;
    return windowHeight - 150 + 65;
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
    // that.chatBotService.getAuthorization().timeout(120000).subscribe(result =>  { 
    //     console.log(result);
    //     that.chatConnectBody= result;
    //     },
    //      err => {
    //     }
    // );      
      console.log(event);      
    }

    exampleSocket.onmessage = function (event) {
     console.log(event.data);
     if(event.data && event.data.length>0)
     {
       let receiveMessage : ReceiveMessage = JSON.parse(event.data);
       if(receiveMessage.activities && receiveMessage.activities.length>0)
       {
         let response = receiveMessage.activities[0];//JSON.parse(that.testText);
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
                 let textArray = that.splitText(response.text);
                 if(textArray.length<=1)
                 {
                   var message = new Message(response.text,'left',watermark);
                   that.messageArray.push(message);
                 }
                 else
                 {
                   var message = new Message(response.text,'left',watermark,'normal',[],textArray);
                   that.messageArray.push(message);
                 }
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

  splitText(str) 
  {
    var newStr = str;
    var array = str.split(/(悉尼|城市)/);
    var textArray = [];
    if(array.length>1)
    {
      for(var i=0;i<array.length;i++)
      {
        if(i==0)
        {
           newStr = array[i];
        }
        else if(i==1)
        {
           newStr += '^'+array[i]+'^';
        }
        else if(i==2)
        {
           newStr +=array[i];
        }
      }
    }

    array = newStr.split(/(\d\d\d\d.\d\d.\d\d - \d\d\d\d.\d\d.\d\d)/);
    if(array.length>1)
    {
        newStr = '';
        for(var i=0;i<array.length;i++)
        {
          if(i==0)
          {
             newStr = array[i];
          }
          else if(i==1)
          {
             newStr += '^'+array[i]+'^';
          }
          else if(i==2)
          {
             newStr +=array[i];
          }
        }        
    }

    array = newStr.split(/(入住时间|入住日期)/);
    if(array.length>1)
    {
        newStr = '';
        for(var i=0;i<array.length;i++)
        {
          if(i==0)
          {
             newStr = array[i];
          }
          else if(i==1)
          {
             newStr += '^'+array[i]+'^';
          }
          else if(i==2)
          {
             newStr +=array[i];
          }
        }        
    }


    array = newStr.split('^');
    for(var i=0;i<array.length;i++)
    {
      if(array[i].search(/(悉尼|城市)/)>=0 )
      {
        textArray.push(new textObject(array[i],1));
      }
      else if(array[i].search(/(\d\d\d\d-\d\d-\d\d - \d\d\d\d-\d\d-\d\d)/)>=0)
      {
        textArray.push(new textObject(array[i],2));
      }
      else if(array[i].search(/(\d\d\d\d(.)\d\d(.)\d\d - \d\d\d\d(.)\d\d(.)\d\d)/)>=0)
      {
        textArray.push(new textObject(array[i],2));
      }
      else if(array[i].search(/(入住时间|入住日期)/)>=0)
      {
        textArray.push(new textObject(array[i],2));
      }
      else if(array[i].length>0)
      {
        textArray.push(new textObject(array[i],0));
      }
    }

    return textArray;
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

  selectCity(name)
  {
      this.sendMessageClick(false,name);
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
