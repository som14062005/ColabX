// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId; // matches service

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId; // matches service

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
