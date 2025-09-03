import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

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
    const companyId = req.user.companyId;
    return this.companyService.sendMessage(companyId, body);
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
}