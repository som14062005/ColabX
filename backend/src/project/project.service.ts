import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { JoinRequest, JoinRequestDocument } from './schemas/join-request.schema';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(JoinRequest.name) private joinRequestModel: Model<JoinRequestDocument>,
  ) {}

  /** 1️⃣ Create (Host) a Project */
  async createProject(ownerId: string, dto: CreateProjectDto) {
    const created = new this.projectModel({
      owner: new Types.ObjectId(ownerId),
      name: dto.name,
      description: dto.description,
      githubLink: dto.githubLink || null,
      techStack: dto.techStack || [],
      requirements: dto.requirements || null,
      difficulty: dto.difficulty || null,
      members: [],
    });
    return created.save();
  }

  /** 2️⃣ Get My Projects (owned + joined accepted) */
  async getMyProjects(userId: string) {
    const owned = await this.projectModel.find({ owner: userId });
    const joined = await this.projectModel.find({ members: userId });

    return { owned, joined };
  }

  /** 3️⃣ Get Available Projects to Join */
  async getAvailableProjectsToJoin(userId: string) {
    const allOtherProjects = await this.projectModel.find({
      owner: { $ne: userId },
      members: { $ne: userId },
    });

    const myRequests = await this.joinRequestModel.find({
      requester: userId,
      status: { $in: ['pending', 'accepted'] },
    });

    const requestedProjectIds = myRequests.map(r => r.project.toString());

    return allOtherProjects.map(project => ({
      ...project.toObject(),
      alreadyRequested: requestedProjectIds.includes(project.id), // ✅ use .id
    }));
  }

  /** 🔹 Helper: Check if user is owner of project */
  async isProjectOwner(userId: string, projectId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    return project.owner.toString() === userId;
  }

  /** 4️⃣ Send Join Request */
  async sendJoinRequest(userId: string, projectId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    if (project.owner.toString() === userId) {
      throw new BadRequestException('You cannot join your own project');
    }
    if (project.members.some(m => m.toString() === userId)) {
      throw new BadRequestException('You are already a member');
    }

    const existing = await this.joinRequestModel.findOne({
      project: projectId,
      requester: userId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) throw new BadRequestException('Request already sent');

    const joinRequest = new this.joinRequestModel({
      project: projectId,
      requester: userId,
      status: 'pending',
    });
    await joinRequest.save();
    return joinRequest;
  }

  /** 5️⃣ Get Pending Join Requests for My Project */
  async getPendingJoinRequests(projectId: string) {
    return this.joinRequestModel
      .find({ project: projectId, status: 'pending' })
      .populate('requester', 'username email');
  }

  /** 6️⃣ Accept Join Request */
  async acceptJoinRequest(projectId: string, requestId: string) {
    const reqDoc = await this.joinRequestModel.findById(requestId);
    if (!reqDoc) throw new NotFoundException('Join request not found');
    if (reqDoc.project.toString() !== projectId) {
      throw new BadRequestException('Request does not belong to this project');
    }

    reqDoc.status = 'accepted';
    await reqDoc.save();

    await this.projectModel.findByIdAndUpdate(projectId, {
      $addToSet: { members: reqDoc.requester },
    });

    return { message: 'Request accepted' };
  }

  /** 7️⃣ Reject Join Request */
  async rejectJoinRequest(projectId: string, requestId: string) {
    const reqDoc = await this.joinRequestModel.findById(requestId);
    if (!reqDoc) throw new NotFoundException('Join request not found');
    if (reqDoc.project.toString() !== projectId) {
      throw new BadRequestException('Request does not belong to this project');
    }

    reqDoc.status = 'rejected';
    await reqDoc.save();
    return { message: 'Request rejected' };
  }
}
