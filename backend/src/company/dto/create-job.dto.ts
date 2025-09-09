import { IsString, IsOptional, IsBoolean, IsArray, IsIn } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[] = [];

  @IsOptional()
  @IsString()
  salary?: string;

  @IsString()
  location: string;

  @IsString()
  @IsIn(['Full-time', 'Part-time', 'Intern'])
  type: string; // Fixed set of options

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
