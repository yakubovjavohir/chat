import { Module } from '@nestjs/common';
import { BotModule } from './modules/bot/bot.module';
import { FilebaseModule } from './modules/filebase/filebase.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule, 
    FilebaseModule,
    MailModule,
  ],
})
export class AppModule {}
