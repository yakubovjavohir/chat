import { Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import { FilebaseService } from './filebase.service';
import { MessageType } from '../bot/interface/bot.service';
import { BotService } from '../bot/bot.service';

@Controller('firebase')
export class FilebaseController {
  constructor(
    private readonly filebaseService: FilebaseService,
    private readonly botService: BotService
  ) {}


  @Post('/send-message')
  sendMessage(@Body() data:MessageType){
    return this.botService.sendMessage(data)
  }

}
