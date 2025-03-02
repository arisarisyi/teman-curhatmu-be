import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway.gateway';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports: [SharedModule],
  providers: [ChatGateway],
})
export class ChatGatewayModule {}
