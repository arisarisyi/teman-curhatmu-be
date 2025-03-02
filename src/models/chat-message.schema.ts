import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseModels } from './base-models.schema';

@Schema()
export class ChatMessage extends BaseModels {
  @Prop({ required: true, type: String, ref: 'ChatTopic' })
  topic: string; // Hubungkan dengan Topik Chat

  @Prop({ required: true, type: String, ref: 'User' })
  user: string; // Hubungkan dengan User

  @Prop({ required: true, enum: ['user', 'bot'] })
  sender: 'user' | 'bot'; // Menentukan siapa pengirimnya

  @Prop({ required: true })
  message: string; // Isi pesan
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
