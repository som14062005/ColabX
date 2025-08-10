import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard) // All routes require authentication using JWT
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 1. Create a new project (Host a Project)
  @Post()
  async createProject(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    const userId = req.user.sub;
    const project = await this.projectService.createProject(userId, createProjectDto);
    return project;
  }

  // 2. Get your projects:
  // Projects you own and projects you joined (accepted)
  @Get('my')
  async getMyProjects(@Req() req) {
    const userId = req.user.sub;
    return this.projectService.getMyProjects(userId);
  }

  // 3. Get available projects to send join requests (exclude your own, exclude projects already joined/requested)
  @Get('available-to-join')
  async getAvailableProjects(@Req() req) {
    const userId = req.user.sub;
    return this.projectService.getAvailableProjectsToJoin(userId);
  }

  // 4. Send join request to a project
  @Post(':id/join-request')
  async sendJoinRequest(@Req() req, @Param('id') projectId: string) {
    const userId = req.user.sub;
    try {
      await this.projectService.sendJoinRequest(userId, projectId);
      return { message: 'Join request sent successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // 5. Get pending join requests for a project you own
  @Get(':id/join-requests')
  async getJoinRequests(@Req() req, @Param('id') projectId: string) {
    const userId = req.user.sub;
    // Confirm the user owns this project before returning requests
    const isOwner = await this.projectService.isProjectOwner(userId, projectId);
    if (!isOwner) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return this.projectService.getPendingJoinRequests(projectId);
  }

  // 6. Accept a join request
  @Post(':id/join-requests/:requestId/accept')
  async acceptJoinRequest(
    @Req() req,
    @Param('id') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    const userId = req.user.sub;
    const isOwner = await this.projectService.isProjectOwner(userId, projectId);
    if (!isOwner) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    try {
      await this.projectService.acceptJoinRequest(projectId, requestId);
      return { message: 'Join request accepted' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // 7. Reject a join request
  @Post(':id/join-requests/:requestId/reject')
  async rejectJoinRequest(
    @Req() req,
    @Param('id') projectId: string,
    @Param('requestId') requestId: string,
  ) {
    const userId = req.user.sub;
    const isOwner = await this.projectService.isProjectOwner(userId, projectId);
    if (!isOwner) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    try {
      await this.projectService.rejectJoinRequest(projectId, requestId);
      return { message: 'Join request rejected' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
