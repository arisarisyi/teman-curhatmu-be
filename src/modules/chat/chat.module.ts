import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SharedModule } from 'src/common/shared.module';
import { AccessTokenStrategy } from 'src/common/strategy';

@Module({
  imports: [SharedModule],
  controllers: [ChatController],
  providers: [ChatService, AccessTokenStrategy],
})
export class ChatModule {}
