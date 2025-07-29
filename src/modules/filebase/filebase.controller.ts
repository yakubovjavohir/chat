import { Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import { MessageType, UserData } from '../bot/interface/bot.service';
import { BotService } from '../bot/bot.service';
import { MailService } from '../mail/mail.service';
import { FilebaseService } from './filebase.service';

@Controller('firebase')
export class FilebaseController {
  constructor(
    private readonly botService: BotService,
    private readonly mailService: MailService,
    private readonly firebaseService: FilebaseService
  ) {}


  @Post('/send-message')
  sendMessage(@Body() data:MessageType){
    return this.botService.sendMessage(data)
  }

  @Delete('/delete-message/:id')
  deleteMessage(@Param('id') id:number, @Body() data:MessageType){
    return this.botService.deleteMessage(id, data)
  }

  @Post('/edit-message')
  editMessage(@Body() data:MessageType){
    return this.botService.editMessage(data)
  }

  // @Post('/send-message/mail')
  // sendMessageMail(@Body() data:any){
  //   return this.mailService.sendMail(data)
  // }

  @Patch('/edit-contact')
  editContact(@Param('id') id:string | number, @Body() data:UserData){
    return this.firebaseService.updateUserContact(data, id)
  }
}
