import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { SharedModule } from 'src/common/shared.module';
import { AccessTokenStrategy } from 'src/common/strategy';

@Module({
  imports: [SharedModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, AccessTokenStrategy],
})
export class ChatbotModule {}
