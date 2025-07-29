import { forwardRef, Module } from '@nestjs/common';
import { FilebaseService } from './filebase.service';
import { FilebaseController } from './filebase.controller';
import { BotModule } from '../bot/bot.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    forwardRef(() => BotModule),
    forwardRef(() => MailModule)
  ],
  controllers: [FilebaseController],
  providers: [FilebaseService],
  exports:[FilebaseService]
})
export class FilebaseModule {}
