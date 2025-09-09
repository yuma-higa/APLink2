import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
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
import type { ChartData } from '../../types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatsSectionProps {
  applicationData: ChartData;
  hiringData: ChartData;
  summary?: { totalApplications: number; interviewsScheduled: number; pendingReviews: number; offersExtended: number };
}

const StatsSection: React.FC<StatsSectionProps> = ({ applicationData, hiringData, summary }) => {
  const totals = {
    totalApplications: summary?.totalApplications ?? 0,
    interviewsScheduled: summary?.interviewsScheduled ?? 0,
    pendingReviews: summary?.pendingReviews ?? 0,
    offersExtended: summary?.offersExtended ?? 0,
  };
  return (
    <Box>
      {/* Key Metrics */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mb: 4,
        '& > *': { 
          flex: '1 1 200px',
          minWidth: '200px'
        } 
      }}>
        <Card sx={{ bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h4" color="primary">{totals.totalApplications.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">Total Applications</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#e8f5e8' }}>
          <CardContent>
            <Typography variant="h4" color="success.main">{totals.interviewsScheduled.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">Interviews Scheduled</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#fff3e0' }}>
          <CardContent>
            <Typography variant="h4" color="warning.main">{totals.pendingReviews.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">Pending Reviews</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#f3e5f5' }}>
          <CardContent>
            <Typography variant="h4" color="secondary">{totals.offersExtended.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">Offers Extended</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3,
        '& > *': { 
          flex: '1 1 400px',
          minWidth: '400px'
        } 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Application Trends</Typography>
            <Line data={applicationData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Monthly Applications'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Hiring Pipeline</Typography>
            <Line data={hiringData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Hiring Progress'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StatsSection;
