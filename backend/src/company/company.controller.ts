import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { FilterStudentsDto } from './dto/filter-students.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('company')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // Debug endpoint to check user data
  @Get('debug/user')
  async debugUser(@Request() req) {
    return {
      user: req.user,
      hasCompanyId: !!req.user.companyId,
      hasStudentId: !!req.user.studentId
    };
  }

  // Student discovery for direct recruiting
  @Get('students')
  async searchStudents(@Request() req, @Query() filters: FilterStudentsDto) {
    try {
      let companyId = req.user.companyId;

      // Auto-create company profile if it doesn't exist
      if (!companyId && req.user.role === 'COMPANY') {
        companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
      }

      if (!companyId) {
        throw new Error('Unable to determine company ID for user');
      }

      return this.companyService.searchStudents(companyId, filters);
    } catch (error) {
      console.error('Error in searchStudents:', error);
      throw error;
    }
  }

  // Dashboard endpoints
  @Get('dashboard/charts')
  async getChartData(@Request() req) {
    try {
      console.log('getChartData - User data:', JSON.stringify(req.user, null, 2));
      
      let companyId = req.user.companyId;
      
      // Auto-create company profile if it doesn't exist
      if (!companyId && req.user.role === 'COMPANY') {
        console.log('No companyId found, creating company profile...');
        companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
        console.log('Created/found companyId:', companyId);
      }
      
      if (!companyId) {
        throw new Error('Unable to determine company ID for user');
      }
      
      console.log('User data:', { userId: req.user.id, companyId, role: req.user.role });
      
      return await this.companyService.getChartData(companyId);
    } catch (error) {
      console.error('Error in getChartData:', error);
      throw error;
    }
  }

  @Get('applications')
  async getApplications(@Request() req) {
    try {
      console.log('getApplications - User data:', JSON.stringify(req.user, null, 2));
      
      let companyId = req.user.companyId;
      
      // Auto-create company profile if it doesn't exist
      if (!companyId && req.user.role === 'COMPANY') {
        console.log('No companyId found, creating company profile...');
        companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
        console.log('Created/found companyId:', companyId);
      }
      
      if (!companyId) {
        throw new Error('Unable to determine company ID for user');
      }
      
      return await this.companyService.getApplications(companyId);
    } catch (error) {
      console.error('Error in getApplications:', error);
      throw error;
    }
  }

  @Get('messages')
  async getMessages(@Request() req) {
    try {
      let companyId = req.user.companyId;
      
      // Auto-create company profile if it doesn't exist
      if (!companyId && req.user.role === 'COMPANY') {
        companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
      }
      
      return await this.companyService.getMessages(companyId);
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  }

  // Application management
  @Put('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.companyService.updateApplicationStatus(id, status);
  }

  @Post('applications')
  async createApplication(@Body() createApplicationDto: CreateApplicationDto) {
    return this.companyService.createApplication(createApplicationDto);
  }

  // Messaging
  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body() body: { studentId: string; content: string }
  ) {
    let companyId = req.user.companyId;
    // Ensure company profile exists and we have an ID, similar to other endpoints
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.sendMessage(companyId, body);
  }

  // Interviews
  @Get('interviews')
  async getInterviews(@Request() req) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.getInterviews(companyId);
  }

  @Get('interviews/upcoming')
  async getUpcomingInterviews(@Request() req) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.getInterviews(companyId, true);
  }

  @Post('interviews')
  async createInterview(@Request() req, @Body() body: { applicationId: string; title: string; description?: string; scheduledAt: string; duration?: number; meetingLink?: string }) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.createInterview(companyId, body as any);
  }

  // Propose time (pending until student accepts)
  @Post('interviews/propose')
  async proposeInterview(@Request() req, @Body() body: { applicationId: string; title: string; description?: string; scheduledAt: string; duration?: number; meetingLink?: string }) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.proposeInterview(companyId, body as any);
  }

  // Profile views analytics (weekly visitors)
  @Get('analytics/views')
  async getViewsAnalytics(@Request() req) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.getViewsChartData(companyId, 8);
  }

  // Interactive students (applied or messaged)
  @Get('students/interactive')
  async getInteractiveStudents(@Request() req) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.getInteractiveStudents(companyId);
  }

  // Profile management
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      let companyId = req.user.companyId;
      
      if (!companyId && req.user.role === 'COMPANY') {
        companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
      }
      
      return this.companyService.getProfile(companyId);
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: UpdateCompanyProfileDto) {
    try {
      let companyId = req.user.companyId;
      
      if (!companyId && req.user.role === 'COMPANY') {
        companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
      }
      
      console.log('Updating profile for companyId:', companyId, 'with data:', updateData);
      return this.companyService.updateProfile(companyId, updateData);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
  }
  }

  // Job postings
  @Get('jobs')
  async listJobs(@Request() req) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.listJobs(companyId);
  }

  @Post('jobs')
  async createJob(@Request() req, @Body() body: CreateJobDto) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.createJob(companyId, body);
  }

  @Put('jobs/:id')
  async updateJob(@Request() req, @Param('id') id: string, @Body() body: UpdateJobDto) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.updateJob(companyId, id, body);
  }

  @Put('jobs/:id/active')
  async setJobActive(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.setJobActive(companyId, id, !!isActive);
  }

  @Delete('jobs/:id')
  async deleteJob(@Request() req, @Param('id') id: string) {
    let companyId = req.user.companyId;
    if (!companyId && req.user.role === 'COMPANY') {
      companyId = await this.companyService.getOrCreateCompanyProfile(req.user);
    }
    return this.companyService.deleteJob(companyId, id);
  }
}
