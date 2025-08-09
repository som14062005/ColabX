import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose'; // ✅ This import is required

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  skills: string[];

  @Prop()
  github: string;

  @Prop()
  bio: string;

 @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
friends: mongoose.Types.ObjectId[];
// ✅ Use ObjectId[] for Mongo references
}

export const UserSchema = SchemaFactory.createForClass(User);
