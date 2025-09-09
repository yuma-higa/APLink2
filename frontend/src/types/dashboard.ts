export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

export interface Student {
  id: number; // application id
  studentId?: string; // underlying student id (for messaging)
  name: string;
  major: string;
  gpa: string;
  year: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: string;
  profileImageUrl?: string;
}
