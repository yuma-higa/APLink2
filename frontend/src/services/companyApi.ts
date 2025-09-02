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
}

class CompanyApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken'); // Fixed: Use 'accessToken' instead of 'token'
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
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

  async getChartData(): Promise<{ applicationData: ChartData; hiringData: ChartData }> {
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
        }
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
        name: app.student?.name || 'Unknown',
        major: app.student?.major || 'Unknown',
        gpa: app.student?.gpa?.toString() || '0.0',
        year: app.student?.year || 'Unknown',
        status: app.status,
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
        isRead: msg.isRead
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

  async updateApplicationStatus(studentId: number, status: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/applications/${studentId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
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
}

export const companyApiService = new CompanyApiService();
