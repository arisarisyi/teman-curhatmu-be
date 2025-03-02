import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseModels } from './base-models.schema';

@Schema()
export class ChatTopic extends BaseModels {
  @Prop({ required: true, type: String, ref: 'User' })
  user: string;

  @Prop({ required: true })
  title: string; // Judul percakapan
}

export const ChatTopicSchema = SchemaFactory.createForClass(ChatTopic);
