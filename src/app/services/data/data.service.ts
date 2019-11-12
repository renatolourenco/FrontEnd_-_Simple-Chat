import { Injectable, Output, EventEmitter } from '@angular/core';

import { ConnectionService } from '../connection/connection.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  @Output()
  public message = new EventEmitter<Object>();
  public openChatWindow = new EventEmitter<Boolean>();
  public updateScroll = new EventEmitter<boolean>();

  private compToDestroy: any;
  private context = null;
  private dialogArray = [];


  constructor(private connectionService: ConnectionService) { }

  private setDialogMessage(msg: Object) {
    this.message.emit(msg)
    this.dialogArray.push(msg);
    localStorage.setItem('simple_advisor', JSON.stringify(this.dialogArray));
    this.setUpdateScroll();
  }

  public cleanVariables() {
    this.context = null;
    this.dialogArray = [];
  }

  public destroyComp() {
    if (this.compToDestroy) {
      this.compToDestroy.destroy();
    }
  }

  public sendMessageToWatson(msg: Object, contextAppend?: any) {
    let watsonObj = {
      context: this.context,
      input: msg['user_text']
    }

    if (contextAppend) {
      for (const [key, value] of Object.entries(contextAppend)) {
        watsonObj['context'][key] = value;
      }
    }

    if ((msg['user_text'] !== '') && (msg['user_text'] !== 'true') && (msg['user_text'] !== 'false')) {
      this.setDialogMessage({ 'user': msg['user_text'] })
    }

    this.connectionService.watson(watsonObj).subscribe(w_res => {
      this.dialogArray[0] = { 'context': w_res['context'] };
      this.context = w_res['context'];
      this.setDialogMessage({ 'bot': w_res['output']['generic'] });
    });

  }

  public setCompToDestroy(comp: any) {
    this.compToDestroy = comp;
  }

  public setOpenChatWindow(open: Boolean) {
    this.openChatWindow.emit(open);
  }

  public setUpdateScroll() {
    this.updateScroll.emit(true);
  }

  public startDialog() {
    let savedData = [];
    savedData = JSON.parse(localStorage.getItem('simple_advisor'));
    if (savedData) {
      savedData.forEach(dialog => {
        if (dialog['context']) {
          this.context = dialog['context'];
          this.dialogArray[0] = { 'context': dialog['context'] };
        } else {
          this.setDialogMessage(dialog);
        }
      });
    } else {
      this.sendMessageToWatson({ 'user_text': '' });
    }
  }

}
