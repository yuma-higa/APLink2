import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

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

  async getMessages(companyId: string) {
    try {
      if (!companyId) {
        console.log('No companyId provided for messages');
        return [];
      }

      const messages = await this.prisma.message.findMany({
        where: { companyId },
        include: {
          student: true
        },
        orderBy: { sentAt: 'desc' }
      });

      return messages.map(msg => ({
        id: msg.id,
        studentName: msg.student?.name || 'Unknown Student',
        content: msg.content,
        sentAt: msg.sentAt,
        isRead: msg.isRead
      }));
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

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

  async updateProfile(companyId: string, updateData: any) {
    try {
      return await this.prisma.company.update({
        where: { id: companyId },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating company profile:', error);
      throw error;
    }
  }

  // Messaging
  async sendMessage(companyId: string, messageData: any) {
    try {
      return await this.prisma.message.create({
        data: {
          companyId,
          studentId: messageData.studentId,
          content: messageData.content,
          sentAt: new Date()
        },
        include: {
          student: true,
          company: true
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

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
}