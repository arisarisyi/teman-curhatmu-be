import { Schema, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class BaseModels extends Document {
  @Prop({ type: String, default: () => uuidv4() }) // UUID sebagai _id
  _id: string;

  @Prop()
  createdBy: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedBy: string;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop()
  deletedBy?: string;
}
