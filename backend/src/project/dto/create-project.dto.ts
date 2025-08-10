import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
  IsUrl,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  // Optional GitHub repository link
  @IsOptional()
  @IsUrl({}, { message: 'Invalid GitHub URL' })
  githubLink?: string;

  // Tech stack array (e.g. ["React", "Node.js"])
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  techStack?: string[];

  // Project requirements (short/long text)
  @IsOptional()
  @IsString()
  requirements?: string;

  // Difficulty level (Beginner, Intermediate, Advanced)
  @IsOptional()
  @IsString()
  difficulty?: string;

  // Owner will be taken from logged-in user, so not required from frontend
  @IsOptional()
  @IsMongoId({ each: true }) // If members are added initially
  members?: string[];
}
