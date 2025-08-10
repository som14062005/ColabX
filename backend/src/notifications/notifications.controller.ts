import { Controller, Post, Body, Param, Patch, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ✅ 1. Get all SENT notifications (must come before :userId route)
  @Get('sent/:userId')
  getSentNotifications(
    @Param('userId') userId: string,
    @Query('status') status?: string
  ) {
    return this.notificationsService.getSentNotifications(userId, status);
  }

  // 2. Get all RECEIVED notifications
  @Get(':userId')
  getNotifications(
    @Param('userId') userId: string,
    @Query('status') status?: string
  ) {
    return this.notificationsService.getNotificationsByUserId(userId, status);
  }

  // 3. Send a friend request
  @Post('send')
  sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  // 4. Accept friend request
  @Patch(':notificationId/accept')
  acceptNotification(@Param('notificationId') id: string) {
    return this.notificationsService.updateStatus(id, 'accepted');
  }

  // 5. Reject friend request
  @Patch(':notificationId/reject')
  rejectNotification(@Param('notificationId') id: string) {
    return this.notificationsService.updateStatus(id, 'rejected');
  }

  // 6. Generic status update
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateNotificationStatusDto
  ) {
    return this.notificationsService.updateStatus(
      id,
      updateStatusDto.status as 'pending' | 'accepted' | 'rejected'
    );
  }

  // 7. Get accepted friends list
  @Get(':userId/friends')
  getFriends(@Param('userId') userId: string) {
    return this.notificationsService.getAcceptedFriends(userId);
  }

  // 8. Remove friend
  @Patch(':userId/remove/:friendId')
  removeFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string
  ) {
    return this.notificationsService.removeFriend(userId, friendId);
  }
}
