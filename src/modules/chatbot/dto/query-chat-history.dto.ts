import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsNumber } from 'class-validator';

export class QueryChatHistoryDto {
  @ApiProperty({ example: 'topic123', description: 'ID of the topic' })
  @IsString()
  topicId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt:asc',
    description:
      'Sort by field and order (e.g., createdAt:asc or createdAt:desc)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
}
