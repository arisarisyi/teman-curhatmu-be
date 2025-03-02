import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomBaseResponseInterceptor } from 'src/common/interceptors/base-response.interceptor';
import { AccessTokenGuard } from 'src/common/guards';
import { CreateChatBotDto } from './dto/chatbot.dto';
import { QueryChatHistoryDto } from './dto/query-chat-history.dto';

@Controller('chatbot')
@ApiTags('chat')
@UseInterceptors(CustomBaseResponseInterceptor)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: ' Post Chat' })
  async getTopic(@Req() req, @Body() body: CreateChatBotDto) {
    const { _id } = req.user.payload;

    const result = await this.chatbotService.sendMessage(body, _id);
    return { result };
  }

  @Get('chat-history')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: ' Post Chat' })
  async chatHistory(@Query() query: QueryChatHistoryDto) {
    const result = await this.chatbotService.getChatHistory(query);
    return { result };
  }
}
