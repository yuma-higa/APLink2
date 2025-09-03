import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FilterStudentsDto } from './dto/filter-students.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  // Dashboard data methods
  async getOrCreateCompanyProfile(user: any): Promise<string> {
    try {
      console.log('User object received:', JSON.stringify(user, null, 2));
      
      // Get the email from the company relation if it exists
      let userEmail = user.company?.email || user.email;
      
      // If still no email, use the auth name as a fallback (since it's unique)
      if (!userEmail) {
        userEmail = `${user.name}@company.com`;
        console.log('No email found, using fallback:', userEmail);
      }
      
      // First check if company profile exists
      let company = await this.prisma.company.findFirst({
        where: { email: userEmail }
      });
      
      if (!company) {
        // Create new company profile
        console.log('Creating company profile for user:', userEmail);
        company = await this.prisma.company.create({
          data: {
            name: user.name || 'Company Name',
            email: userEmail,
            industry: 'Technology',
            location: 'Not specified',
            description: 'Welcome to our company!'
          }
        });
        
        // Update the auth record to link to the new company
        await this.prisma.auth.update({
          where: { id: user.id },
          data: { companyId: company.id }
        });
        
        console.log('Created company profile with ID:', company.id);
      }
      
      return company.id;
    } catch (error) {
      console.error('Error in getOrCreateCompanyProfile:', error);
      throw error;
    }
  }

  async getChartData(companyId: string) {
    try {
      if (!companyId) {
        console.log('No companyId provided, returning empty chart data');
        return this.getEmptyChartData();
      }

      // Get applications for this company
      const applications = await this.prisma.application.findMany({
        where: { companyId },
        include: {
          student: true,
          job: true
        }
      });

      return this.processChartData(applications);
    } catch (error) {
      console.error('Error in getChartData:', error);
      return this.getEmptyChartData();
    }
  }

  async getApplications(companyId: string) {
    try {
      if (!companyId) {
        console.log('No companyId provided for applications');
        return [];
      }

      const applications = await this.prisma.application.findMany({
        where: { companyId },
        include: {
          student: true,
          job: true
        },
        orderBy: { appliedAt: 'desc' }
      });

      return applications.map(app => ({
        id: app.id,
        studentName: app.student?.name || 'Unknown Student',
        jobTitle: app.job?.title || 'Unknown Position',
        status: app.status,
        appliedAt: app.appliedAt,
        email: app.student?.email
      }));
    } catch (error) {
      console.error('Error in getApplications:', error);
      return [];
    }
  }

  // Removed duplicate getMessages method to resolve duplicate implementation error.

  // Application management
  async createApplication(createApplicationDto: CreateApplicationDto) {
    try {
      return await this.prisma.application.create({
        data: {
          ...createApplicationDto,
          appliedAt: new Date()
        },
        include: {
          student: true,
          job: true,
          company: true
        }
      });
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(applicationId: string, status: any) {
    try {
      return await this.prisma.application.update({
        where: { id: applicationId },
        data: { 
          status: status as any,
          updatedAt: new Date()
        },
        include: {
          student: true,
          job: true
        }
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Company profile management
  async getProfile(companyId: string) {
    try {
      if (!companyId) {
        return null;
      }

      return await this.prisma.company.findUnique({
        where: { id: companyId },
        include: {
          jobs: true,
          applications: {
            include: {
              student: true,
              job: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting company profile:', error);
      return null;
    }
  }

  // Messaging
  // Removed duplicate sendMessage method to resolve duplicate implementation error.

  // Helper methods
  private getEmptyChartData() {
    return {
      applicationData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Applications',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
        }]
      },
      hiringData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Hired',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Interviewed',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#ed6c02',
            backgroundColor: 'rgba(237, 108, 2, 0.1)',
            tension: 0.4,
          }
        ]
      }
    };
  }

  private processChartData(applications: any[]) {
    // Get last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    // Group applications by month
    const applicationsByMonth = new Array(6).fill(0);
    const hiredByMonth = new Array(6).fill(0);
    const interviewsByMonth = new Array(6).fill(0);

    applications.forEach(app => {
      const appMonth = new Date(app.appliedAt).getMonth();
      const monthDiff = (currentMonth - appMonth + 12) % 12;
      
      if (monthDiff < 6) {
        const index = 5 - monthDiff;
        applicationsByMonth[index]++;
        
        if (app.status === 'HIRED') {
          hiredByMonth[index]++;
        } else if (app.status === 'INTERVIEWING') {
          interviewsByMonth[index]++;
        }
      }
    });

    return {
      applicationData: {
        labels: last6Months,
        datasets: [{
          label: 'Applications',
          data: applicationsByMonth,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
        }]
      },
      hiringData: {
        labels: last6Months,
        datasets: [
          {
            label: 'Hired',
            data: hiredByMonth,
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Interviewed',
            data: interviewsByMonth,
            borderColor: '#ed6c02',
            backgroundColor: 'rgba(237, 108, 2, 0.1)',
            tension: 0.4,
          }
        ]
      }
    };
  }

  // Student discovery and filtering
  async searchStudents(companyId: string, filters: FilterStudentsDto) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.major) {
      where.major = { contains: filters.major, mode: 'insensitive' };
    }

    if (filters.year) {
      where.year = filters.year;
    }

    if (filters.skills) {
      where.skills = {
        hasSome: [filters.skills]
      };
    }

    if (filters.minGpa) {
      where.gpa = {
        gte: parseFloat(filters.minGpa)
      };
    }

    const students = await this.prisma.student.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        major: true,
        year: true,
        gpa: true,
        skills: true,
        bio: true,
        linkedin: true,
        github: true,
        profileImageUrl: true,
        applications: {
          where: { companyId },
          select: {
            id: true,
            status: true,
            appliedAt: true,
            job: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    return students.map(student => ({
      ...student,
      hasApplied: student.applications.length > 0,
      applicationHistory: student.applications
    }));
  }

  // Application management for companies
  // Removed duplicate updateApplicationStatus method to resolve duplicate implementation error.

  async getApplicationDetails(companyId: string, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        companyId
      },
      include: {
        student: true,
        job: true,
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        }
      }
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    return application;
  }

  // Interview management
  async createInterview(companyId: string, interviewData: CreateInterviewDto) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: interviewData.applicationId,
        companyId
      }
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    const interview = await this.prisma.interview.create({
      data: {
        title: interviewData.title,
        description: interviewData.description,
        scheduledAt: new Date(interviewData.scheduledAt),
        duration: interviewData.duration,
        meetingLink: interviewData.meetingLink,
        studentId: application.studentId,
        companyId,
        applicationId: interviewData.applicationId
      },
      include: {
        student: true,
        application: {
          include: {
            job: true
          }
        }
      }
    });

    return interview;
  }

  async getInterviews(companyId: string, upcoming: boolean = false) {
    const where: any = { companyId };
    
    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.status = 'SCHEDULED';
    }

    const interviews = await this.prisma.interview.findMany({
      where,
      include: {
        student: true,
        application: {
          include: {
            job: true
          }
        }
      },
      orderBy: { scheduledAt: upcoming ? 'asc' : 'desc' }
    });

    return interviews;
  }

  // Messaging
  async sendMessage(companyId: string, messageData: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        companyId,
        studentId: messageData.studentId,
        content: messageData.content
      },
      include: {
        student: true
      }
    });

    return message;
  }

  async getMessages(companyId: string, studentId?: string) {
    const where: any = { companyId };
    
    if (studentId) {
      where.studentId = studentId;
    }

    const messages = await this.prisma.message.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { sentAt: 'desc' }
    });

    return messages;
  }

  // Profile views analytics
  async getProfileViewAnalytics(companyId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await this.prisma.profileView.findMany({
      where: {
        viewedCompanyId: companyId,
        viewedAt: {
          gte: startDate
        }
      },
      include: {
        student: true
      },
      orderBy: { viewedAt: 'desc' }
    });

    const viewsByDate = {};
    views.forEach(view => {
      const date = view.viewedAt.toISOString().split('T')[0];
      if (!viewsByDate[date]) {
        viewsByDate[date] = 0;
      }
      viewsByDate[date]++;
    });

    return {
      totalViews: views.length,
      uniqueViewers: new Set(views.map(v => v.studentId)).size,
      viewsByDate,
      recentViewers: views.slice(0, 10)
    };
  }

  // Company profile management

  async updateProfile(companyId: string, updateData: UpdateCompanyProfileDto) {
    try {
      console.log('Updating company profile:', { companyId, updateData });
      
      // Validate that the company exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { id: companyId }
      });
      
      if (!existingCompany) {
        throw new Error(`Company with ID ${companyId} not found`);
      }
      
      // Update the company profile
      const updatedCompany = await this.prisma.company.update({
        where: { id: companyId },
        data: updateData
      });

      console.log('Company profile updated successfully:', updatedCompany);
      return updatedCompany;
    } catch (error) {
      console.error('Error updating company profile:', error);
      throw error;
    }
  }

  // Keep the old method names for backward compatibility
  async getCompanyProfile(companyId: string) {
    return this.getProfile(companyId);
  }

  async updateCompanyProfile(companyId: string, updateData: UpdateCompanyProfileDto) {
    return this.updateProfile(companyId, updateData);
  }
}