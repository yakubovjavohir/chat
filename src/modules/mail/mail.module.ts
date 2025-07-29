import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { FilebaseModule } from '../filebase/filebase.module';

@Module({
  imports:[forwardRef(() => FilebaseModule)],
  controllers: [],
  providers: [MailService],
  exports:[MailService]
})
export class MailModule {}
