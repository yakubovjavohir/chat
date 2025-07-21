import { forwardRef, Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { FilebaseModule } from '../filebase/filebase.module';

@Module({
  imports:[forwardRef(() => FilebaseModule)],
  controllers: [BotController],
  providers: [BotService],
  exports:[BotService]
})
export class BotModule {}
