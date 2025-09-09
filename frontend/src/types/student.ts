export interface StudentSummary {
  id: string;
  name: string;
  email?: string;
  major?: string;
  year?: string;
  gpa?: number;
  skills?: string[];
  bio?: string;
  linkedin?: string;
  github?: string;
  profileImageUrl?: string;
  hasApplied?: boolean;
  applicationHistory?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    job?: { title?: string };
  }>;
}

export interface StudentFilters {
  search?: string;
  major?: string;
  year?: string;
  skills?: string; // comma separated or single keyword
  minGpa?: string;
}

