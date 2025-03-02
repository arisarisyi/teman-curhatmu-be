import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CustomBaseResponseInterceptor } from 'src/common/interceptors/base-response.interceptor';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards';
import { CreateChatTopicDto } from './dto/create-topic.dto';
import { QueryChatTopicDto } from './dto/query-chat-topic.dto';

@ApiTags('chat')
@Controller('chat')
@UseInterceptors(CustomBaseResponseInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post Topic' })
  async findAll(@Req() req, @Body() bodyPayload: CreateChatTopicDto) {
    const { _id } = req.user.payload;

    const result = await this.chatService.createChatTopic(_id, bodyPayload);
    return { result };
  }

  @Get('topic')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: ' Topic' })
  async getTopic(@Req() req, @Query() queryDto: QueryChatTopicDto) {
    const { _id } = req.user.payload;

    const result = await this.chatService.getChatTopicsWithPagination(
      _id,
      queryDto,
    );
    return { result };
  }
}
