// src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notification, NotificationDocument } from './schemas/notification.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /** Create a new friend request notification */
  async create(dto: CreateNotificationDto) {
    const notification = new this.notificationModel({
      ...dto,
      status: 'pending', // default
    });
    return notification.save();
  }

  /** Get all notifications RECEIVED by a user */
  async getNotificationsByUserId(userId: string, status?: string) {
    const filter: any = { receiverId: userId };
    if (status) {
      filter.status = status;
    }

    return this.notificationModel
      .find(filter)
      .populate('senderId', 'username email skills')
      .exec();
  }

  /** ✅ Get all notifications SENT by a user */
  async getSentNotifications(userId: string, status?: string) {
    const filter: any = { senderId: userId };
    if (status) {
      filter.status = status;
    }

    return this.notificationModel
      .find(filter)
      .populate('receiverId', 'username email skills')
      .exec();
  }

  /** Update a notification's status to accepted/rejected/pending */
  async updateStatus(id: string, status: 'accepted' | 'rejected' | 'pending') {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = status;
    await notification.save();

    // If accepted, add both users to each other's friend list
    if (status === 'accepted') {
      await this.addFriends(
        notification.senderId.toString(),
        notification.receiverId.toString()
      );

      // Return updated friend list for the receiver
      const receiver = await this.userModel
        .findById(notification.receiverId)
        .populate('friends', 'username email skills')
        .exec();

      return {
        notification,
        updatedFriends: receiver?.friends || [],
      };
    }

    return notification;
  }

  /** Helper: add each user to the other's friends list */
  private async addFriends(userId: string, friendId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendId },
    });

    await this.userModel.findByIdAndUpdate(friendId, {
      $addToSet: { friends: userId },
    });
  }

  /** Get friends of a user */
  async getFriends(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('friends', 'username email skills')
      .exec();

    return user?.friends || [];
  }

  /** Get all accepted friends from notifications data */
  async getAcceptedFriends(userId: string) {
    const accepted = await this.notificationModel
      .find({
        status: 'accepted',
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .populate('senderId', 'username email skills')
      .populate('receiverId', 'username email skills')
      .lean();

    return accepted.map((n) =>
      n.senderId._id.toString() === userId ? n.receiverId : n.senderId
    );
  }

  /** Remove a friend and delete their accepted request records */
  async removeFriend(userId: string, friendId: string) {
    await this.notificationModel.deleteMany({
      status: 'accepted',
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    });

    // Also remove them from each other's user.friends list
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await this.userModel.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    return { message: 'Friend removed successfully' };
  }
}
