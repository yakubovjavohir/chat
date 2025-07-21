import { Controller, Post, Body, Delete, Param} from '@nestjs/common';
import { BotService } from './bot.service';
import { MessageType } from './interface/bot.service';

@Controller('bot')
export class BotController {
  constructor(
    private readonly botService: BotService,
  ) {}

  @Delete('/delete-message/:id')
  deleteMessage(@Param('id') id:number, @Body() data:MessageType){
    return this.botService.deleteMessage(id, data)
  }
}
