import { IsNotEmpty, IsString } from 'class-validator';
export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  ALERT = 'alert',
  INFO = 'info',
}

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  type: NotificationType;
}
