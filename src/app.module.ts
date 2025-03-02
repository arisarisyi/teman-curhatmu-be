import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeminiModule } from './modules/gemini/gemini.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatGatewayModule } from './modules/chat-gateway/chat-gateway.module';

@Module({
  imports: [
    GeminiModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AuthModule,
    ChatModule,
    ChatbotModule,
    EventEmitterModule.forRoot(),
    ChatGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
