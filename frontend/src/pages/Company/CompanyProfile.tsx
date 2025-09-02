import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from "../../layouts/Header";
import { useAuth } from '../../hooks/useAuth';
import StatsSection from '../../components/Company/StatsSection';
import StudentTable from '../../components/Company/StudentTable';
import ChatSection from '../../components/Company/ChatSection';
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
        const [chartsData, applicationsData, messagesData] = await Promise.all([
          companyApiService.getChartData(),
          companyApiService.getApplications(),
          companyApiService.getMessages(),
        ]);

        setChartData(chartsData);
        setStudents(applicationsData);
        setMessages(messagesData);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChange = async (studentId: number, newStatus: Student['status']) => {
    try {
      await companyApiService.updateApplicationStatus(studentId, newStatus);
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId ? { ...student, status: newStatus } : student
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
    console.log('Send email to:', student);
    // Implement send email logic
  };

  const handleSendMessage = async (content: string) => {
    try {
      // For now, send to first student - in real app, you'd have a selected student
      if (students.length > 0) {
        await companyApiService.sendMessage(content, students[0].id.toString());
        const newMessage = {
          id: messages.length + 1,
          sender: 'Company HR',
          content,
          timestamp: new Date().toLocaleString(),
          isRead: true
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch {
      setError('Failed to send message');
    }
  };

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
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {chartData && (
            <StatsSection 
              applicationData={chartData.applicationData} 
              hiringData={chartData.hiringData} 
            />
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
            messages={messages}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
          />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default CompanyProfile;
