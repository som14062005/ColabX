// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string; // Reference to the user (can store ObjectId as string)

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'unread', enum: ['read', 'unread'] })
  status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
