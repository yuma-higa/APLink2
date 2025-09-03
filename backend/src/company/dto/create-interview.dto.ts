import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  applicationId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  scheduledAt: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  meetingLink?: string;
}
