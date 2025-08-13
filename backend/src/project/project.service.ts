import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private normalizeUserId(userId: string) {
    if (!userId) throw new BadRequestException('User ID missing');
    if (!Types.ObjectId.isValid(userId))
      throw new BadRequestException('Invalid user ID');
    return new Types.ObjectId(userId);
  }

  async createProject(userId: string, createProjectDto: CreateProjectDto) {
    const ownerId = this.normalizeUserId(userId);
    const newProject = new this.projectModel({
      ...createProjectDto,
      owner: ownerId,
      members: [],
      joinRequests: [],
    });
    return newProject.save();
  }

  async getMyProjects(userId: string) {
    const userObjectId = this.normalizeUserId(userId);

    const owned = await this.projectModel.find({ owner: userObjectId }).exec();
    const joined = await this.projectModel.find({ members: userObjectId }).exec();

    return { owned, joined };
  }

  async getAvailableProjectsToJoin(userId: string) {
    const userObjectId = this.normalizeUserId(userId);

    return this.projectModel
      .find({
        owner: { $ne: userObjectId },
        members: { $ne: userObjectId },
        'joinRequests.user': { $ne: userObjectId },
      })
      .exec();
  }

  async sendJoinRequest(userId: string, projectId: string) {
    const userObjectId = this.normalizeUserId(userId);
    if (!Types.ObjectId.isValid(projectId))
      throw new BadRequestException('Invalid project ID');
    const projectObjectId = new Types.ObjectId(projectId);

    const project = await this.projectModel.findById(projectObjectId).exec();
    if (!project) throw new NotFoundException('Project not found');

    if (project.owner.equals(userObjectId)) {
      throw new BadRequestException('Cannot request to join your own project');
    }

    if (project.members.some((m) => m.equals(userObjectId))) {
      throw new BadRequestException('Already a member of this project');
    }

    if (project.joinRequests.some((jr) => jr.user.equals(userObjectId))) {
      throw new BadRequestException(
        'You have already sent a join request for this project',
      );
    }

    project.joinRequests.push({
      user: userObjectId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await project.save();

    return { message: 'Join request sent successfully' };
  }

  async isProjectOwner(userId: string, projectId: string): Promise<boolean> {
    const userObjectId = this.normalizeUserId(userId);
    if (!Types.ObjectId.isValid(projectId)) return false;
    const projectObjectId = new Types.ObjectId(projectId);

    const project = await this.projectModel
      .findOne({
        _id: projectObjectId,
        owner: userObjectId,
      })
      .exec();

    return !!project;
  }

  async getPendingJoinRequests(projectId: string) {
    if (!Types.ObjectId.isValid(projectId))
      throw new BadRequestException('Invalid project ID');
    const projectObjectId = new Types.ObjectId(projectId);

    const project = await this.projectModel
      .findById(projectObjectId)
      .populate('joinRequests.user', 'name email')
      .exec();
    if (!project) throw new NotFoundException('Project not found');

    return (project.joinRequests || []).filter(
      (jr) => jr.status === 'pending',
    );
  }

  async acceptJoinRequest(
    projectId: string,
    requestUserId: string,
    actingUserId?: string,
  ) {
    if (!Types.ObjectId.isValid(projectId))
      throw new BadRequestException('Invalid project ID');
    if (!Types.ObjectId.isValid(requestUserId))
      throw new BadRequestException('Invalid request user ID');

    const projectObjectId = new Types.ObjectId(projectId);
    const requestUserObjectId = new Types.ObjectId(requestUserId);

    const project = await this.projectModel.findById(projectObjectId).exec();
    if (!project) throw new NotFoundException('Project not found');

    if (actingUserId) {
      const actingObjectId = this.normalizeUserId(actingUserId);
      if (!project.owner.equals(actingObjectId))
        throw new ForbiddenException('Only project owner can accept requests');
    }

    const jrIndex = project.joinRequests.findIndex((jr) =>
      jr.user.equals(requestUserObjectId),
    );
    if (jrIndex === -1)
      throw new NotFoundException('Join request not found');

    project.joinRequests[jrIndex].status = 'accepted';
    project.joinRequests[jrIndex].updatedAt = new Date();

    if (!project.members.some((m) => m.equals(requestUserObjectId))) {
      project.members.push(requestUserObjectId);
    }

    await project.save();
    return { message: 'Join request accepted' };
  }

  async rejectJoinRequest(
    projectId: string,
    requestUserId: string,
    actingUserId?: string,
  ) {
    if (!Types.ObjectId.isValid(projectId))
      throw new BadRequestException('Invalid project ID');
    if (!Types.ObjectId.isValid(requestUserId))
      throw new BadRequestException('Invalid request user ID');

    const projectObjectId = new Types.ObjectId(projectId);
    const requestUserObjectId = new Types.ObjectId(requestUserId);

    const project = await this.projectModel.findById(projectObjectId).exec();
    if (!project) throw new NotFoundException('Project not found');

    if (actingUserId) {
      const actingObjectId = this.normalizeUserId(actingUserId);
      if (!project.owner.equals(actingObjectId))
        throw new ForbiddenException('Only project owner can reject requests');
    }

    const jrIndex = project.joinRequests.findIndex((jr) =>
      jr.user.equals(requestUserObjectId),
    );
    if (jrIndex === -1)
      throw new NotFoundException('Join request not found');

    project.joinRequests[jrIndex].status = 'rejected';
    project.joinRequests[jrIndex].updatedAt = new Date();

    await project.save();
    return { message: 'Join request rejected' };
  }

  // ✅ FIXED: Get joined projects (user is member, owner is different)
  async getJoinedProjects(userId: string) {
    const userObjectId = this.normalizeUserId(userId);

    const projects = await this.projectModel
      .find({
        members: userObjectId,
        owner: { $ne: userObjectId },
      })
      .exec();

    if (!projects.length) {
      throw new NotFoundException('No joined projects found');
    }

    return projects;
  }

  async getAllUserProjects(userId: string) {
    const userObjectId = this.normalizeUserId(userId);

    const ownedProjects = await this.projectModel.find({
      owner: userObjectId,
    });

    const joinedProjects = await this.projectModel.find({
      members: userObjectId,
      owner: { $ne: userObjectId },
    });

    return [
      ...ownedProjects.map((p) => ({ ...p.toObject(), role: 'owner' })),
      ...joinedProjects.map((p) => ({ ...p.toObject(), role: 'member' })),
    ];
  }

  private categorizeProjects(projects: any[], currentUserId: string) {
    return projects.map((project) => {
      let role = 'owner';

      if (project.owner?.toString() === currentUserId) {
        role = 'owner';
      } else if (
        project.members?.some((m: string) => m.toString() === currentUserId)
      ) {
        role = 'member';
      }

      return {
        ...project.toObject?.() ?? project,
        role,
      };
    });
  }

  async getAllProjectsForUser(userId: string) {
    const userObjectId = this.normalizeUserId(userId);

    const projects = await this.projectModel.find({
      $or: [{ owner: userObjectId }, { members: userObjectId }],
    });

    return this.categorizeProjects(projects, userId);
  }
}
