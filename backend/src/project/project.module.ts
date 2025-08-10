import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { JoinRequest, JoinRequestSchema } from './schemas/join-request.schema';

@Module({
  imports: [
    // Register Project and JoinRequest schemas with Mongoose
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: JoinRequest.name, schema: JoinRequestSchema }
    ]),
  ],
  controllers: [ProjectController],   // Your project endpoints here
  providers: [ProjectService],        // Business logic for projects
  exports: [ProjectService],          // Export service if needed elsewhere
})
export class ProjectModule {}
