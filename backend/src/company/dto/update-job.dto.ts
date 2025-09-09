import { IsString, IsOptional, IsBoolean, IsArray, IsIn } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Full-time', 'Part-time', 'Intern'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
