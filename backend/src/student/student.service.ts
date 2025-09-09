import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // Profile management
  async getOrCreateStudentProfile(user: any): Promise<string> {
    try {
      console.log('User object received:', JSON.stringify(user, null, 2));
      
      // Get the email from the student relation if it exists
      let userEmail = user.student?.email || user.email;
      
      // If still no email, use the auth name as a fallback
      if (!userEmail) {
        userEmail = `${user.name}@student.com`;
        console.log('No email found, using fallback:', userEmail);
      }
      
      // First check if student profile exists
      let student = await this.prisma.student.findFirst({
        where: { email: userEmail }
      });
      
      if (!student) {
        // Create new student profile
        console.log('Creating student profile for user:', userEmail);
        student = await this.prisma.student.create({
          data: {
            name: user.name || 'Student Name',
            email: userEmail,
            major: 'Computer Science',
            gpa: 3.0,
            year: 'Senior',
            skills: ['Programming']
          }
        });
        
        // Update the auth record to link to the new student
        await this.prisma.auth.update({
          where: { id: user.id },
          data: { studentId: student.id }
        });
        
        console.log('Created student profile with ID:', student.id);
      }
      
      return student.id;
    } catch (error) {
      console.error('Error in getOrCreateStudentProfile:', error);
      throw error;
    }
  }

  async getProfile(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        applications: {
          include: {
            company: true,
            job: true
          }
        }
      }
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  async updateProfile(studentId: string, updateData: UpdateProfileDto) {
    try {
      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: updateData
      });

      return updatedStudent;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Student profile not found');
      }
      throw error;
    }
  }

  // Company search and filtering
  async searchCompanies(filters: SearchCompanyDto) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.industry) {
      where.industry = { contains: filters.industry, mode: 'insensitive' };
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.size) {
      where.size = filters.size;
    }

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        jobs: {
          where: {
            isActive: true,
            ...(filters.position && {
              title: { contains: filters.position, mode: 'insensitive' }
            }),
            ...(filters.jobType && {
              type: { contains: filters.jobType, mode: 'insensitive' }
            })
          }
        }
      }
    });

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      location: company.location,
      description: company.description,
      logoUrl: company.logoUrl,
      website: company.website,
      size: company.size,
      foundedYear: company.foundedYear,
      activeJobs: company.jobs.length,
      jobs: company.jobs
    }));
  }

  async getCompanyDetails(companyId: string, studentId: string) {
    // Track profile view
    await this.trackProfileView(studentId, companyId);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        jobs: {
          where: { isActive: true }
        },
        applications: {
          where: { studentId },
          include: {
            job: true
          }
        }
      }
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      ...company,
      myApplications: company.applications
    };
  }

  // Application management
  async createApplication(studentId: string, applicationData: CreateApplicationDto) {
    // Check if student already applied for this job
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        studentId,
        jobId: applicationData.jobId,
        companyId: applicationData.companyId
      }
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this position');
    }

    const application = await this.prisma.application.create({
      data: {
        studentId,
        jobId: applicationData.jobId,
        companyId: applicationData.companyId,
        coverLetter: applicationData.coverLetter
      },
      include: {
        job: true,
        company: true
      }
    });

    return application;
  }

  async getMyApplications(studentId: string) {
    const applications = await this.prisma.application.findMany({
      where: { studentId },
      include: {
        job: true,
        company: true,
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      company: {
        id: app.company.id,
        name: app.company.name,
        logoUrl: app.company.logoUrl
      },
      job: {
        id: app.job.id,
        title: app.job.title,
        type: app.job.type,
        location: app.job.location
      },
      interviews: app.interviews,
      coverLetter: app.coverLetter,
      notes: app.notes
    }));
  }

  // Messaging
  async sendMessage(studentId: string, messageData: SendMessageDto) {
    // Prevent immediate duplicates (same sender+content within last 5 minutes)
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const last = await this.prisma.message.findFirst({
      where: {
        studentId,
        companyId: messageData.companyId,
        // sender exists in schema but typings may miss it; cast
        sender: 'STUDENT',
        content: messageData.content,
        sentAt: { gte: fiveMinAgo }
      } as any,
      orderBy: { sentAt: 'desc' },
      include: { company: true }
    });
    if (last) return last;

    const message = await this.prisma.message.create({
      data: {
        studentId,
        companyId: messageData.companyId,
        content: messageData.content,
        sender: 'STUDENT'
      } as any,
      include: {
        company: true
      }
    });

    return message;
  }

  async getMessages(studentId: string, companyId?: string) {
    const where: any = { studentId };
    
    if (companyId) {
      where.companyId = companyId;
    }

    const messages = await this.prisma.message.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      },
      // For conversation view (when companyId is provided) we want chronological order bottom-up
      orderBy: { sentAt: companyId ? 'asc' : 'desc' }
    });

    // Group messages by company if no specific company is requested
    if (!companyId) {
      const groupedMessages = messages.reduce((acc, message) => {
        const companyId = message.companyId;
        if (!acc[companyId]) {
          acc[companyId] = {
            company: message.company,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          };
        }
        acc[companyId].messages.push(message);
        if (!message.isRead) {
          acc[companyId].unreadCount++;
        }
        if (!acc[companyId].lastMessage || message.sentAt > acc[companyId].lastMessage.sentAt) {
          acc[companyId].lastMessage = message;
        }
        return acc;
      }, {});

      return Object.values(groupedMessages);
    }

    return messages;
  }

  async markMessagesAsRead(studentId: string, companyId: string) {
    await this.prisma.message.updateMany({
      where: {
        studentId,
        companyId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  }

  // Interview management
  async getUpcomingInterviews(studentId: string) {
    const interviews = await this.prisma.interview.findMany({
      where: {
        studentId,
        scheduledAt: {
          gte: new Date()
        },
        status: 'SCHEDULED'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    return interviews;
  }

  async getInterviewHistory(studentId: string) {
    const interviews = await this.prisma.interview.findMany({
      where: {
        studentId,
        OR: [
          { status: 'COMPLETED' },
          { status: 'CANCELLED' },
          {
            AND: [
              { scheduledAt: { lt: new Date() } },
              { status: 'SCHEDULED' }
            ]
          }
        ]
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    return interviews;
  }

  // Profile views tracking
  private async trackProfileView(studentId: string, companyId: string) {
    // Check if view already exists today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingView = await this.prisma.profileView.findFirst({
      where: {
        studentId,
        viewedCompanyId: companyId,
        viewedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (!existingView) {
      await this.prisma.profileView.create({
        data: {
          studentId,
          viewedCompanyId: companyId
        }
      });
    }
  }

  // Dashboard data
  async getDashboardData(studentId: string) {
    const [
      applicationsCount,
      upcomingInterviews,
      recentMessages,
      applicationsByStatus
    ] = await Promise.all([
      this.prisma.application.count({
        where: { studentId }
      }),
      this.prisma.interview.count({
        where: {
          studentId,
          scheduledAt: { gte: new Date() },
          status: 'SCHEDULED'
        }
      }),
      this.prisma.message.count({
        where: {
          studentId,
          isRead: false
        }
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { studentId },
        _count: true
      })
    ]);

    const statusCounts = applicationsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    return {
      totalApplications: applicationsCount,
      upcomingInterviews,
      unreadMessages: recentMessages,
      applicationsByStatus: statusCounts
    };
  }
}
