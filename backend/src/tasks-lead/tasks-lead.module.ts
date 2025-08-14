import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksLeadService } from './tasks-lead.service';
import { TasksLeadController } from './tasks-lead.controller';
import { Task, TaskSchema } from './schema/task.schema';
import { Project, ProjectSchema } from '../project/schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema } // 👈 Needed for ProjectModel injection
    ]),
  ],
  controllers: [TasksLeadController],
  providers: [TasksLeadService],
})
export class TasksLeadModule {}
