import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module'; // ✅ FIXED NAME
import { ProjectModule } from './project/project.module';
import { TasksMemberModule } from './tasks-member/tasks-member.module';
import { TasksLeadModule } from './tasks-lead/tasks-lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost:27017/colabx'),
    AuthModule,
    UsersModule,
    NotificationsModule, // ✅ FIXED NAME
    ProjectModule, 
    TasksMemberModule, 
    TasksLeadModule,
  ],
})
export class AppModule {}
