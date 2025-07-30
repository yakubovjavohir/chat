import { Body, Controller, Delete, Param, Patch, Post} from '@nestjs/common';
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
  deleteMessage(@Param('id') messageId: string | number, @Body() {userId}){
    return this.firebaseService.deleteMessage(messageId, userId)
  }

  @Post('/edit-message')
  editMessage(@Body() data:MessageType){
    return this.botService.editMessage(data)
  }

  // @Post('/send-message/mail')
  // sendMessageMail(@Body() data:any){
  //   return this.mailService.sendMail(data)
  // }

  @Patch('/edit-contact/:id')
  editContact(@Param('id') id:string | number, @Body() data:UserData){
    return this.firebaseService.updateUserContact(data, id)
  }

  @Delete('/delete-contact/:id')
  deleteContact(@Param('id') userId:number | string){
    return this.firebaseService.deleteUserContact(userId)
  }
}
