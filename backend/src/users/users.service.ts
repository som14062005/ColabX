import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async searchUsers(search?: string, skill?: string) {
    const filter: any = {};

    if (search) {
      filter.username = { $regex: search, $options: 'i' };
    }

    if (skill) {
      filter.skills = { $in: [skill] };
    }

    return this.userModel
      .find(filter)
      .select('-password -friends')
      .exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .exec();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async addFriend(userId: string, friendId: string) {
    const user = await this.userModel.findById(userId);
    const friend = await this.userModel.findById(friendId);

    if (!user || !friend) {
      throw new NotFoundException('User or friend not found');
    }

    const friendObjectId = new Types.ObjectId(friendId);

    const alreadyFriend = user.friends.some(id => id.equals(friendObjectId));

    if (!alreadyFriend) {
      user.friends.push(friendObjectId);
      await user.save();
    }

    return { message: 'Friend added successfully' };
  }

  async getFriends(userId: string) {
  const user = await this.userModel
    .findById(userId)
    .populate('friends', '-password')
    .exec();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user.friends;
}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(userData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }
  
}
