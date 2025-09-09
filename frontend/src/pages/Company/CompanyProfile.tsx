import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "../../layouts/Header";
import { useAuth } from '../../hooks/useAuth';
import StatsSection from '../../components/Company/StatsSection';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import StudentTable from '../../components/Company/StudentTable';
import ChatSection from '../../components/Company/ChatSection';
import JobPosting from '../../components/Company/JobPosting';
import { companyApiService } from '../../services/companyApi';
import { isAuthenticated } from '../../utils/auth';
import type { ChartData, Student } from '../../types/dashboard';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CompanyProfile: React.FC = () => {
  const { user, getUserRole, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ applicationData: ChartData; hiringData: ChartData } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewsData, setViewsData] = useState<ChartData | null>(null);
  const [chatTarget, setChatTarget] = useState<string | null>(null);
  const location = useLocation();
  
  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);
  
  // Get user info more reliably
  const currentUser = getCurrentUser();
  const userName = user || currentUser || 'Company User';
  const userRole = getUserRole() || 'COMPANY';

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch data if user is not authenticated
      if (!isAuthenticated() || (!currentUser && !user)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [chartsData, applicationsData, messagesData, viewsChart] = await Promise.all([
          companyApiService.getChartData(),
          companyApiService.getApplications(),
          companyApiService.getMessages(),
          companyApiService.getViewsAnalytics(),
        ]);

        setChartData(chartsData);
        setStudents(applicationsData);
        setMessages(messagesData);
        setViewsData(viewsChart);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err instanceof Error && err.message === 'Unauthorized') {
          // If unauthorized, redirect to login
          navigate('/login', { replace: true });
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, user, navigate]); // Add dependencies to re-fetch when user changes

  // Read query params for tab and student preselect (from Discover Students)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qpTab = params.get('tab');
    const qpStudent = params.get('studentId');
    if (qpTab === 'messages') setTabValue(2);
    if (qpStudent) setChatTarget(qpStudent);
  }, [location.search]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChange = async (applicationId: number, newStatus: Student['status']) => {
    try {
      await companyApiService.updateApplicationStatus(applicationId, newStatus);
      setStudents(prev => 
        prev.map(student => 
          student.id === applicationId ? { ...student, status: newStatus } : student
        )
      );
    } catch (err) {
      setError('Failed to update status: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleViewDetails = (student: Student) => {
    console.log('View details for:', student);
    // Implement view details logic
  };

  const handleSendEmail = (student: Student) => {
    if (student.studentId) {
      setChatTarget(student.studentId);
      setTabValue(2); // switch to Messages tab
    } else {
      setError('No student target found for messaging.');
    }
  };

  // messaging handled inline in ChatSection props to avoid unused vars

  const handleMarkAsRead = (messageId: number) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header userName={userName} userRole={userRole} />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
          Company Recruiter Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Analytics" />
            <Tab label="Applications" />
            <Tab label="Messages" />
            <Tab label="Job Posting" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {chartData && (
            <StatsSection 
              applicationData={chartData.applicationData} 
              hiringData={chartData.hiringData}
              summary={(chartData as any).summary}
            />
          )}
          {viewsData && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Weekly Page Visitors</Typography>
              <Line data={viewsData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: true, text: 'Last 8 Weeks' }
                },
                scales: { y: { beginAtZero: true } }
              }} />
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <StudentTable
            students={students}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
            onSendEmail={handleSendEmail}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ChatSection
            messages={messages as any}
            onSendMessage={async (content, studentId) => {
              try {
                await companyApiService.sendMessage(content, studentId);
                setMessages(prev => [
                  ...prev,
                  { id: prev.length + 1, sender: 'Me', content, timestamp: new Date().toLocaleString(), isRead: true, studentId, from: 'COMPANY' }
                ]);
              } catch {
                setError('Failed to send message');
              }
            }}
            onMarkAsRead={handleMarkAsRead}
            initialStudentId={chatTarget || undefined}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <JobPosting />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default CompanyProfile;
