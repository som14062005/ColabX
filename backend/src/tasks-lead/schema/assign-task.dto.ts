// assign-task.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class AssignTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  deadline?: string;
}
