import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  subtasks: string[];

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ default: 'Assigned', enum: ['Assigned', 'In Progress', 'Completed'] })
  status: string;

  @Prop({ required: true, enum: ['Low', 'Medium', 'High'] })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  assignedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
