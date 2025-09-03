import { IsString, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
