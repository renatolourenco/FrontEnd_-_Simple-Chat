import { Component, ComponentRef, OnInit, AfterViewInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { ChatDialogLineComponent } from './chat-dialog-line/chat-dialog-line.component';

import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'dc-chat-body',
  templateUrl: './chat-body.component.html',
  styleUrls: ['./chat-body.component.css']
})
export class ChatBodyComponent implements OnInit, AfterViewInit {

  @ViewChild('chatLineComp', { read: ViewContainerRef, static: true })
  public chatLineComp;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private dataService: DataService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.dataService.message.subscribe(msgObj => {
      this.dataProcess(msgObj);
    })
  }

  private dataProcess(msgObject: Object) {

    let dialogObjType: String;

    if (msgObject['bot']) {
      dialogObjType = 'bot';
    } else {
      dialogObjType = 'user';
    }

    if (dialogObjType === 'user') {
      this.createLine(msgObject, dialogObjType, false);
    } else {
      let countBallons = msgObject['bot'].reduce((acc, cur) => cur['response_type'] === 'text' ? ++acc : acc, 0);
      countBallons += msgObject['bot'].reduce((acc, cur) => cur['response_type'] === 'image' ? ++acc : acc, 0);

      msgObject['bot'].forEach((objValue, idx) => {
        if (objValue['response_type'] && objValue['response_type'] === 'text') {
          if (idx === countBallons - 1) {
            this.createLine(objValue, dialogObjType, true);
          } else {
            this.createLine(objValue, dialogObjType, false);
          }
        } else if (
          objValue['response_type'] && (
          objValue['response_type'] === 'image' ||
          objValue['response_type'] === 'option')
        ) {
          this.createLine(objValue, dialogObjType, false);
        }
      });
    }
  }

  private createLine(msgObj: Object, objType: String, showAvatar: Boolean): ChatDialogLineComponent {
    const factory = this.componentFactoryResolver.resolveComponentFactory(ChatDialogLineComponent);
    const ref: ComponentRef<ChatDialogLineComponent> = this.chatLineComp.createComponent(factory);
    ref.instance.setDialogObject(msgObj)
    ref.instance.setDialogObjType(objType);
    ref.instance.setShowAvatarFlag(showAvatar);
    ref.changeDetectorRef.detectChanges();
    return ref.instance;
  }

}
