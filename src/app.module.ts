import { Module } from '@nestjs/common';
import { BotModule } from './modules/bot/bot.module';
import { FilebaseModule } from './modules/filebase/filebase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule, 
    FilebaseModule,
    AuthModule
  ],
})
export class AppModule {}
