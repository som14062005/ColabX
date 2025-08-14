    import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    Get,
    Req,
    UseGuards,
    } from '@nestjs/common';
    import { JwtAuthGuard } from '../auth/jwt-auth.guard';
    import { TasksLeadService } from './tasks-lead.service';

    @Controller('tasks-lead')
    export class TasksLeadController {
    constructor(private readonly tasksLeadService: TasksLeadService) {}

    /**
     * Assign a task to a project member
     */
    @Post(':projectId/assign/:userId')
@UseGuards(JwtAuthGuard)
async assignTask(
  @Param('projectId') projectId: string,
  @Param('userId') userId: string,
  @Body() taskData: any,
  @Req() req: any
) {
  return this.tasksLeadService.assignTask(
    projectId,
    userId,
    taskData,
    req.user.userId // ✅ Fix here
  );
}
    /**
     * Toggle a member's role between Lead and Member
     */
    @Patch(':projectId/role/:memberId')
@UseGuards(JwtAuthGuard)
async toggleRole(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Req() req: any
) {
    console.log("🔍 Transfer Ownership Request:", {
        projectId,
        memberId,
        jwtUserId: req.user.userId // ✅ Correct key
    });

    return this.tasksLeadService.transferOwnership(
        projectId,
        memberId,
        req.user.userId // ✅ Fix here
    );
}    
 /**
   * Get all tasks assigned to a specific member by the lead
   */

  @Get(':projectId/member/:memberId/tasks')
  @UseGuards(JwtAuthGuard)
  async getTasksAssignedToMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Req() req: any
  ) {
    return this.tasksLeadService.getTasksAssignedToMember(
      projectId,
      memberId,
      req.user.userId
    );
  }
    }
