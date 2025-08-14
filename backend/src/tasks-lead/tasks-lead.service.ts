import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './schema/task.schema';
import { Project } from '../project/schemas/project.schema';

@Injectable()
export class TasksLeadService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}

  /**
   * Assign a task to a project member
   */
  async assignTask(
    projectId: string,
    userId: string,
    taskData: any,
    currentUserId: string,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    // Only owner can assign tasks
    if (project.owner.toString() !== currentUserId) {
      throw new ForbiddenException('Only the project owner can assign tasks');
    }

    // Check if user is part of the project
    const isMember = project.members.some(
      (memberId) => memberId.toString() === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('User is not part of this project');
    }

    // Create and save task
    const formattedTask = {
      ...taskData,
      assignedTo: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(projectId),
      assignedAt: new Date(),
    };

    const assignedTask = await this.taskModel.create(formattedTask);

    return {
      success: true,
      message: 'Task assigned successfully',
      data: assignedTask,
    };
  }

  /**
   * Transfer project ownership
   */
  async transferOwnership(
    projectId: string,
    targetMemberId: string,
    requestUserId: string,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const requestUserObjectId = new Types.ObjectId(requestUserId);
    const targetMemberObjectId = new Types.ObjectId(targetMemberId);

    // 1️⃣ Only current owner can transfer ownership
    if (!project.owner.equals(requestUserObjectId)) {
      throw new ForbiddenException('Only the project owner can transfer ownership');
    }

    // 2️⃣ Target must be a member
    const isMember = project.members.some((m) =>
      m.equals(targetMemberObjectId),
    );
    if (!isMember) {
      throw new BadRequestException(
        'Target user is not a member of the project',
      );
    }

    // 3️⃣ If target is already owner
    if (project.owner.equals(targetMemberObjectId)) {
      throw new BadRequestException('Target user is already the owner');
    }

    // 4️⃣ Swap: move current owner to members, promote target
    const oldOwnerId = project.owner;
    project.owner = targetMemberObjectId;

    project.members = project.members.map((m) =>
      m.equals(targetMemberObjectId) ? oldOwnerId : m,
    );

    await project.save();

    return {
      success: true,
      message: 'Ownership transferred successfully',
      newOwner: project.owner,
      members: project.members,
    };
  }
  async getTasksAssignedToMember(
  projectId: string,
  memberId: string,
  currentUserId: string
) {
  const project = await this.projectModel.findById(projectId);
  if (!project) throw new NotFoundException('Project not found');

  // ✅ Only the project owner (lead) can view assigned tasks
  if (project.owner.toString() !== currentUserId) {
    throw new ForbiddenException('Only the project owner can view member tasks');
  }

  // ✅ Ensure the member exists in this project
  const isMember = project.members.some(
    (memberIdInProject) => memberIdInProject.toString() === memberId
  );
  if (!isMember) {
    throw new ForbiddenException('User is not part of this project');
  }

  // ✅ Fetch all tasks assigned to this member
  const tasks = await this.taskModel.find({
    projectId: project._id,
    assignedTo: new Types.ObjectId(memberId)
  });

  return {
    success: true,
    message: `Tasks assigned to member ${memberId}`,
    count: tasks.length,
    data: tasks
  };
}
}
