import { Module } from '@nestjs/common';
import { BotModule } from './modules/bot/bot.module';
import { FilebaseModule } from './modules/filebase/filebase.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule, 
    FilebaseModule,
  ],
})
export class AppModule {}
