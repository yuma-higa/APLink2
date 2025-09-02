import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNotEmpty, 
  MaxLength, 
  MinLength 
} from 'class-validator';

export enum ApplicationStatus {
    Applied = 'APPLIED',
    REVIEWING = 'REVIEWING',
    INTERVIEWING = 'INTERVIEWING',
    OFFERED = 'OFFERED',
    REJECTED = 'REJECTED',
    HIRED = 'HIRED'
}
export class CreateApplicationDto{
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}