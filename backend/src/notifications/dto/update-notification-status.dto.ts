import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateNotificationStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['pending', 'accepted', 'rejected'])
  status: 'pending' | 'accepted' | 'rejected';
}
