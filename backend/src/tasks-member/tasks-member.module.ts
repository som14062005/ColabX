import { Module } from '@nestjs/common';
import { TasksMemberController } from './tasks-member.controller';
import { TasksMemberService } from './tasks-member.service';

@Module({
  controllers: [TasksMemberController],
  providers: [TasksMemberService]
})
export class TasksMemberModule {}
