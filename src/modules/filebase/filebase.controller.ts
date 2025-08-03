import { Body, Controller, Delete, Param, Patch, Post} from '@nestjs/common';
import { MessageType } from '../../config/types/message';
import { UserData } from '../../config/types/user';
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
  async sendMessage(@Body() data:MessageType){
    const id = data.id as string
    const user = await this.firebaseService.findOneUser(id)
    data.userId = await this.firebaseService.userId(id)
    if(user?.role === 'bot'){
      return this.botService.sendMessage(data)
    }
    
    if(user?.role === 'email'){
      const linkArray = data?.link ? [data.link] : [];
      return this.mailService.sendEmail(id, user.email, data.subject, data.message, linkArray, data.role)
    }

  }

  @Post('ext')
  async expriment(@Body() {userId}:any){
    return await this.firebaseService.id(userId) 
  }

  @Delete('/delete-message/:id')
  deleteMessage(@Param('id') messageId: string | number, @Body() {userId, id}){
    return this.firebaseService.deleteMessage(messageId, id, userId)
  }

  @Patch('/edit-message/:id')
  async editMessage(@Param('id') messageId:string | number, @Body() data:MessageType){
    const { id } = data
    const user = await this.firebaseService.findOneUser(id as string)
    if(user?.service === 'telegram_bot'){
      const messagaData = await this.firebaseService.findOneMessage(id as string,messageId) as MessageType
      return await this.botService.editMessage(messageId as number, messagaData)
    }
  }

  // @Post('/send-message/mail')
  // sendMessageMail(@Body() {userId, to, title, text, attachments, role}:any){
  //   return this.mailService.sendEmail(userId, to, title, text, attachments, role)
  // }

  @Patch('/edit-contact/:id')
  editContact(@Param('id') id:string, @Body() data:UserData){
    return this.firebaseService.updateUserContact(data, id)
  }

  @Delete('/delete-contact/:id')
  deleteContact(@Param('id') id:string, {userId}){
    return this.firebaseService.deleteUserContact(id, userId)
  }
}
