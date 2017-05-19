import { Component, ViewChild, ViewChildren, QueryList, Pipe, PipeTransform} from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/Rx';
import { DomSanitizer } from '@angular/platform-browser';


import {
  StackConfig,
  Stack,
  Card,
  ThrowEvent,
  DragEvent,
  SwingStackComponent,
  SwingCardComponent
} from 'angular2-swing';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('myswing1') swingStack: SwingStackComponent;
  @ViewChildren('mycards1') swingCards: QueryList<SwingCardComponent>;

  cards: Array<any>;
  stackConfig: StackConfig;
  recentCard: string = '';
  currentCard: number = 0;
  allvideos: any[];
  rate = 0;

  constructor(private http: Http, public sanitizer:DomSanitizer) {
    this.stackConfig = {
      throwOutConfidence: (offsetX, offsetY, element) => {
        return Math.min(Math.abs(offsetX) / (element.offsetWidth / 2), 1);
      },
      transform: (element, x, y, r) => {
        this.onItemMove(element, x, y, r);
      },
      throwOutDistance: (d) => {
        return 800;
      }
    };
  }

  ngAfterViewInit() {
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: DragEvent) => {
      event.target.style.background = '#ffffff';
    });

    this.cards = [{ id: {}, snippet: {} }];
    this.getVideos();
  }

  // Called whenever we drag an element
  onItemMove(element, x, y, r) {
    var color = '';
    var abs = Math.abs(x);
    let min = Math.trunc(Math.min(16 * 16 - abs, 16 * 16));
    let hexCode = this.decimalToHex(min, 2);

    if (x < 0) {
      color = '#FF' + hexCode + hexCode;
    } else {
      color = '#' + hexCode + 'FF' + hexCode;
    }

    element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  // Connected through HTML
  voteUp(like: boolean) {
    let removedCard = this.cards.pop();
    this.rate=0;
    this.addNewCards(1);
    if (like) {
      this.recentCard = 'You liked: ' + removedCard.snippet.title;
    } else {
      this.recentCard = 'You disliked: ' + removedCard.snippet.title;
    }
  }

  // Add new cards to our array
  addNewCards(count: number) {

    var randomnumber = Math.floor((Math.random() * 50) + 1);

    debugger;
    this.cards.pop();
    if (this.currentCard <= this.allvideos.length) {
      let data = this.allvideos[randomnumber];
      this.cards.push(data);

      this.currentCard++;
    }
    else {

    }

  }

  getVideos() {

    this.http.get("https://www.googleapis.com/youtube/v3/search?q=cover%20songs&maxResults=50&part=snippet&key=AIzaSyDBJ9dAotqI6w4ZRuMSBLHlNc988k5jMbM&type=video")
      .map(data => data.json())
      .subscribe(result => {
        this.allvideos = result.items;
        this.addNewCards(1);
      },error => {
        console.log("error while calling api :  " + error)
      })

  }

  // http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
      hex = "0" + hex;
    }

    return hex;
  }

  getUrl() {
    if(this.cards[0].snippet.thumbnails != undefined)
    {
    return this.cards[0].snippet.thumbnails.high.url;
    //return this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/"+ this.cards[0].id.videoId +"?autoplay=0");
    }  
}

  handleratings(e){
    this.rate = e;
  }

}
