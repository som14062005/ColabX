// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { User, UserSchema } from '../users/user.schema'; // make sure path is correct

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema }, // register User model here
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
