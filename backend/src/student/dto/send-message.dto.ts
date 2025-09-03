import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  companyId: string;

  @IsString()
  content: string;
}
