import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseModels } from './base-models.schema';

@Schema()
export class User extends BaseModels {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
