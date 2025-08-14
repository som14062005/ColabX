import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ _id: false })
export class JoinRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

const JoinRequestSchema = SchemaFactory.createForClass(JoinRequest);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  githubLink: string;

  @Prop({ type: [String], default: [] })
  techStack: string[];

  @Prop({ trim: true })
  requirements: string;

  @Prop({ trim: true })
  difficulty: string;

 @Prop({ type: Types.ObjectId, ref: 'User', required: true })
owner: Types.ObjectId;

@Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
members: Types.ObjectId[];


  @Prop({ type: [JoinRequestSchema], default: [] })
  joinRequests: JoinRequest[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Update timestamps for joinRequests
ProjectSchema.pre<ProjectDocument>('save', function (next) {
  if (this.joinRequests) {
    this.joinRequests.forEach((jr) => {
      if (!jr.createdAt) jr.createdAt = new Date();
      jr.updatedAt = new Date();
    });
  }
  next();
});
