const API_BASE_URL = 'http://localhost:3000';

class StudentApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private getAuthHeadersNoContentType() {
    const token = localStorage.getItem('accessToken');
    return {
      ...(token && { Authorization: `Bearer ${token}` })
    } as Record<string, string>;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  // Profile
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/student/profile`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  async updateProfile(payload: any) {
    const res = await fetch(`${API_BASE_URL}/student/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  async uploadProfileImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/student/profile/image`, {
      method: 'POST',
      headers: this.getAuthHeadersNoContentType(),
      body: form
    });
    return this.handleResponse(res); // { url }
  }

  async getDashboard() {
    const res = await fetch(`${API_BASE_URL}/student/dashboard`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  // Company search
  async searchCompanies(filters: Partial<{ search: string; industry: string; location: string; size: string; position: string; jobType: string }>) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length) params.append(k, String(v));
    });
    const qs = params.toString();
    const url = `${API_BASE_URL}/student/companies${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  async getCompanyDetails(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/student/companies/${companyId}`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  // Applications
  async createApplication(payload: { companyId: string; jobId: string; coverLetter?: string }) {
    const res = await fetch(`${API_BASE_URL}/student/applications`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  async getMyApplications() {
    const res = await fetch(`${API_BASE_URL}/student/applications`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  // Messages
  async sendMessage(payload: { companyId: string; content: string }) {
    const res = await fetch(`${API_BASE_URL}/student/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  async getMessages(companyId?: string) {
    const url = companyId ? `${API_BASE_URL}/student/messages?companyId=${companyId}` : `${API_BASE_URL}/student/messages`;
    const res = await fetch(url, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  async markMessagesAsRead(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/student/messages/${companyId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(res);
  }

  // Interviews
  async getUpcomingInterviews() {
    const res = await fetch(`${API_BASE_URL}/student/interviews/upcoming`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }

  async getInterviewHistory() {
    const res = await fetch(`${API_BASE_URL}/student/interviews/history`, { headers: this.getAuthHeaders() });
    return this.handleResponse(res);
  }
}

export const studentApi = new StudentApiService();
