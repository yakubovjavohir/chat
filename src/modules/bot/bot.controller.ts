import { Controller, Post, Body, Delete, Param, Patch} from '@nestjs/common';
import { BotService } from './bot.service';
import { MessageType } from './interface/bot.service';

@Controller('bot')
export class BotController {
  constructor(
    private readonly botService: BotService,
  ) {}
}
