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
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // helper to support both req.user.userId and req.user.sub
  private getUserIdFromReq(req: any): string {
    return req.user?.userId || req.user?.sub || null;
  }

  @Post()
  async createProject(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');
    return this.projectService.createProject(userId, createProjectDto);
  }

  @Get('my')
  async getMyProjects(@Req() req) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');
    return this.projectService.getMyProjects(userId);
  }

  @Get('available-to-join')
  async getAvailableProjects(@Req() req) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');
    return this.projectService.getAvailableProjectsToJoin(userId);
  }

  @Post(':id/join-request')
  async sendJoinRequest(@Req() req, @Param('id') projectId: string) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');
    try {
      await this.projectService.sendJoinRequest(userId, projectId);
      return { message: 'Join request sent successfully' };
    } catch (error) {
      throw new HttpException(error.message || 'Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/join-requests')
  async getJoinRequests(@Req() req, @Param('id') projectId: string) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');

    const isOwner = await this.projectService.isProjectOwner(userId, projectId);
    if (!isOwner) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.projectService.getPendingJoinRequests(projectId);
  }

  @Post(':id/join-requests/:requestUserId/accept')
  async acceptJoinRequest(
    @Req() req,
    @Param('id') projectId: string,
    @Param('requestUserId') requestUserId: string,
  ) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');

    const isOwner = await this.projectService.isProjectOwner(userId, projectId);
    if (!isOwner) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.projectService.acceptJoinRequest(projectId, requestUserId, userId);
    return { message: 'Join request accepted' };
  }

  @Post(':id/join-requests/:requestUserId/reject')
  async rejectJoinRequest(
    @Req() req,
    @Param('id') projectId: string,
    @Param('requestUserId') requestUserId: string,
  ) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');

    const isOwner = await this.projectService.isProjectOwner(userId, projectId);
    if (!isOwner) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.projectService.rejectJoinRequest(projectId, requestUserId, userId);
    return { message: 'Join request rejected' };
  }

  @Get('joined')
  async getJoinedProjects(@Req() req) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');
    return this.projectService.getJoinedProjects(userId);
  }

  @Get('all')
  async getAllProjects(@Req() req) {
    const userId = this.getUserIdFromReq(req);
    if (!userId) throw new UnauthorizedException('User ID missing');
    return this.projectService.getAllProjectsForUser(userId);
  }
}
