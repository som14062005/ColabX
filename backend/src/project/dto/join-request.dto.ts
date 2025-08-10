import { IsMongoId, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateJoinRequestDto {
  @IsMongoId()
  project: string; // The project ID you want to join

  @IsOptional()
  @IsString()
  message?: string; // Optional note/message to the project owner
}

export class UpdateJoinRequestStatusDto {
  @IsString()
  @IsIn(['pending', 'accepted', 'rejected'])
  status: 'pending' | 'accepted' | 'rejected';
}
