import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatBotDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public topicId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public userMessage: string;
}
