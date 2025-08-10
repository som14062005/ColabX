import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Optional GitHub Link
  @Prop()
  githubLink?: string;

  // Tech stack (array of strings, e.g., ["React", "Node.js"])
  @Prop({ type: [String], default: [] })
  techStack: string[];

  // Requirements (string, could be multi-line)
  @Prop()
  requirements?: string;

  @Prop()
  difficulty?: string; // e.g., "Beginner", "Intermediate", "Advanced"

  // Owner (the user who created the project)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  // Collaborators (users added to project)
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
