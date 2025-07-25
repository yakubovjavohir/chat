import { Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import { MessageType } from '../bot/interface/bot.service';
import { BotService } from '../bot/bot.service';

@Controller('firebase')
export class FilebaseController {
  constructor(
    private readonly botService: BotService
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
}
