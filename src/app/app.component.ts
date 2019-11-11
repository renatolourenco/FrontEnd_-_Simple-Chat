import { Component, OnInit } from '@angular/core';

import { DataService } from './services/data/data.service';

@Component({
  selector: 'dc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title: String;
  public showChatWindow: Boolean;

  constructor(private dataService: DataService) {
    this.title = 'simple-chat-front';
    this.showChatWindow = false;
  }

  ngOnInit() {
    this.dataService.openChatWindow.subscribe(open => {
      this.showChatWindow = open;
    });
    this.dataService.updateScroll.subscribe(() => {
      this.updateScroll();
    });
  }

  private updateScroll() {
    const chatBody = document.getElementById('dc_chat_body');
    setTimeout(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 250);
  }

}
