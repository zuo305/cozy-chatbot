import { Injectable } from '@angular/core';
@Injectable()
export class DateFormatService{
	constructor() {
	}

    //from yyyy-mm-dd to date
  dateFormatBackToDate(dateString) 
  {
    if(dateString)
    {
      var array = dateString.split('-');
      if(array.length==3)
      {
          var d = new Date(array[0],array[1]-1,array[2]);
          return d;
      }

    }

    return null;

  }

  addDays(date : Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }





   getCorrectDateString(date : Date) : string
     {
      var day = date.getDate();
      var monthIndex = date.getMonth()+1;
      var year = date.getFullYear();

      var str = year + "-";

      if(monthIndex<10)
      {
          str = str + "0" + monthIndex;
      }
      else
      {
          str = str + monthIndex;
      }

      if (day<10)
      {
          str = str + "-" + "0" + day;
      }
      else
      {
          str = str + "-" + day;
      }

      return str;

     }


    
}

