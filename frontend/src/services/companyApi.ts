import type { StudentSummary } from '../types/student';
const API_BASE_URL = 'http://localhost:3000';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }>;
}
interface ChartSummary { totalApplications: number; interviewsScheduled: number; pendingReviews: number; offersExtended: number }

interface Student {
  id: number;
  name: string;
  major: string;
  gpa: string;
  year: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'Hired';
  appliedDate: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  from?: 'COMPANY' | 'STUDENT';
}

class CompanyApiService {
  private toUiStatus(apiStatus: string): 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'Hired' {
    const map: Record<string, any> = {
      APPLIED: 'Applied',
      REVIEWING: 'Interviewing', // collapse to Interviewing in UI
      INTERVIEWING: 'Interviewing',
      OFFERED: 'Offered',
      REJECTED: 'Rejected',
      HIRED: 'Hired'
    };
    return map[apiStatus] ?? 'Applied';
  }

  private toApiStatus(uiStatus: string): 'APPLIED' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'HIRED' {
    const map: Record<string, any> = {
      Applied: 'APPLIED',
      Interviewing: 'INTERVIEWING',
      Offered: 'OFFERED',
      Rejected: 'REJECTED',
      Hired: 'HIRED'
    };
    // default safe fallback
    return map[uiStatus] ?? 'APPLIED';
  }
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken'); // Fixed: Use 'accessToken' instead of 'token'
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async searchStudents(filters: Partial<{ search: string; major: string; year: string; skills: string; minGpa: string }>): Promise<StudentSummary[]> {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length) params.append(k, String(v));
    });
    const qs = params.toString();
    const url = `${API_BASE_URL}/company/students${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, { headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if unauthorized
        localStorage.removeItem('accessToken'); // Fixed: Use 'accessToken' instead of 'token'
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  async getChartData(): Promise<{ applicationData: ChartData; hiringData: ChartData; summary: ChartSummary }> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/dashboard/charts`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Return fallback data
      return {
        applicationData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Applications',
            data: [65, 78, 90, 81, 96, 105],
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
              data: [12, 15, 18, 20, 22, 25],
              borderColor: '#2e7d32',
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Interviewed',
              data: [25, 30, 35, 40, 45, 50],
              borderColor: '#ed6c02',
              backgroundColor: 'rgba(237, 108, 2, 0.1)',
              tension: 0.4,
            }
          ]
        },
        summary: { totalApplications: 0, interviewsScheduled: 0, pendingReviews: 0, offersExtended: 0 }
      };
    }
  }

  async getApplications(): Promise<Student[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/applications`, {
        headers: this.getAuthHeaders()
      });
      const applications = await this.handleResponse(response);
      
      // Transform backend data to frontend format
      return applications.map((app: any) => ({
        id: app.id,
        studentId: app.studentId || app.student?.id,
        name: app.studentName || app.student?.name || 'Unknown',
        major: app.major || app.student?.major || 'Unknown',
        gpa: (app.gpa ?? app.student?.gpa ?? 0).toString(),
        year: app.year || app.student?.year || 'Unknown',
        profileImageUrl: app.profileImageUrl || app.student?.profileImageUrl,
        status: this.toUiStatus(app.status),
        appliedDate: new Date(app.appliedAt).toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Return fallback data
      return [
        {
          id: 1,
          name: 'Alice Johnson',
          major: 'Computer Science',
          gpa: '3.8',
          year: 'Junior',
          status: 'Interviewing',
          appliedDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Bob Smith',
          major: 'Software Engineering',
          gpa: '3.6',
          year: 'Senior',
          status: 'Applied',
          appliedDate: '2024-01-14'
        }
      ];
    }
  }

  async getViewsAnalytics(): Promise<ChartData> {
    const response = await fetch(`${API_BASE_URL}/company/analytics/views`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getInterviews(upcoming?: boolean): Promise<any[]> {
    const url = upcoming ? `${API_BASE_URL}/company/interviews/upcoming` : `${API_BASE_URL}/company/interviews`;
    const response = await fetch(url, { headers: this.getAuthHeaders() });
    return this.handleResponse(response);
  }

  async createInterview(payload: { applicationId: string; title: string; description?: string; scheduledAt: string; duration?: number; meetingLink?: string }) {
    const response = await fetch(`${API_BASE_URL}/company/interviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(response);
  }

  async proposeInterview(payload: { applicationId: string; title: string; description?: string; scheduledAt: string; duration?: number; meetingLink?: string }) {
    const response = await fetch(`${API_BASE_URL}/company/interviews/propose`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(response);
  }

  async getInteractiveStudents(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/company/students/interactive`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getMessages(): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/messages`, {
        headers: this.getAuthHeaders()
      });
      const messages = await this.handleResponse(response);
      
      // Transform backend data to frontend format
      return messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.student?.name || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.sentAt).toLocaleString(),
        isRead: msg.isRead,
        from: msg.sender,
        // augment with student id for targeting
        // @ts-ignore - extend shape for ChatSection
        studentId: msg.student?.id,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Return fallback data
      return [
        {
          id: 1,
          sender: 'Alice Johnson',
          content: 'Thank you for the interview opportunity.',
          timestamp: '2024-01-16 10:30',
          isRead: false
        }
      ];
    }
  }

  async updateApplicationStatus(applicationId: number, status: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status: this.toApiStatus(status) })
      });
      await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  async sendMessage(content: string, studentId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ content, studentId })
      });
      await this.handleResponse(response);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Job postings
  async getJobs(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/company/jobs`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  async createJob(payload: { title: string; description: string; requirements: string[]; type: string; location: string; salary?: string; isActive?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/company/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  async updateJob(id: string, payload: Partial<{ title: string; description: string; requirements: string[]; type: string; location: string; salary?: string; isActive?: boolean }>) {
    const res = await fetch(`${API_BASE_URL}/company/jobs/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  async setJobActive(id: string, isActive: boolean) {
    const res = await fetch(`${API_BASE_URL}/company/jobs/${id}/active`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isActive })
    });
    return this.handleResponse(res);
  }

  async deleteJob(id: string) {
    const res = await fetch(`${API_BASE_URL}/company/jobs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(res);
  }
}

export const companyApiService = new CompanyApiService();
