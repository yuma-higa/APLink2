import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { StudentService } from './student.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('student')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('STUDENT')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // Profile endpoints
  @Get('profile')
  async getProfile(@Request() req) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getProfile(studentId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.updateProfile(studentId, updateData);
  }

  // Upload profile image and return public URL
  @Post('profile/image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = path.join(process.cwd(), 'uploads', 'profile');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const name = `student_${Date.now()}${ext}`;
        cb(null, name);
      }
    })
  }))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    const url = `/uploads/profile/${file.filename}`;
    return { url };
  }

  // Dashboard
  @Get('dashboard')
  async getDashboard(@Request() req) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getDashboardData(studentId);
  }

  // Company search and discovery
  @Get('companies')
  async searchCompanies(@Query() filters: SearchCompanyDto) {
    return this.studentService.searchCompanies(filters);
  }

  @Get('companies/:id')
  async getCompanyDetails(@Request() req, @Param('id') companyId: string) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getCompanyDetails(companyId, studentId);
  }

  // Application management
  @Post('applications')
  async createApplication(@Request() req, @Body() applicationData: CreateApplicationDto) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.createApplication(studentId, applicationData);
  }

  @Get('applications')
  async getMyApplications(@Request() req) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getMyApplications(studentId);
  }

  // Messaging
  @Post('messages')
  async sendMessage(@Request() req, @Body() messageData: SendMessageDto) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.sendMessage(studentId, messageData);
  }

  @Get('messages')
  async getMessages(@Request() req, @Query('companyId') companyId?: string) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getMessages(studentId, companyId);
  }

  @Put('messages/:companyId/read')
  async markMessagesAsRead(@Request() req, @Param('companyId') companyId: string) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.markMessagesAsRead(studentId, companyId);
  }

  // Interview management
  @Get('interviews/upcoming')
  async getUpcomingInterviews(@Request() req) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getUpcomingInterviews(studentId);
  }

  @Get('interviews/pending')
  async getPendingInterviews(@Request() req) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getPendingInterviews(studentId);
  }

  @Post('interviews/:id/accept')
  async acceptInterview(@Request() req, @Param('id') id: string) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.acceptInterview(studentId, id);
  }

  @Get('interviews/history')
  async getInterviewHistory(@Request() req) {
    const studentId = await this.studentService.getOrCreateStudentProfile(req.user);
    return this.studentService.getInterviewHistory(studentId);
  }
}
