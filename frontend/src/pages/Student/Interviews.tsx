import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';

const Interviews: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const [u, h] = await Promise.all([studentApi.getUpcomingInterviews(), studentApi.getInterviewHistory()]);
      if (!ignore) { setUpcoming(u); setHistory(h); }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Interviews</Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>Upcoming</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {upcoming.map(i => (
            <Box key={i.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{i.title} • {i.application?.job?.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{i.company?.name} • {new Date(i.scheduledAt).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
          {upcoming.length === 0 && (<Box><Typography variant="body2" color="text.secondary">No upcoming interviews.</Typography></Box>)}
        </Box>

        <Typography variant="h6" sx={{ mb: 1 }}>History</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {history.map(i => (
            <Box key={i.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{i.title} • {i.application?.job?.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{i.company?.name} • {new Date(i.scheduledAt).toLocaleString()} • {i.status}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
          {history.length === 0 && (<Box><Typography variant="body2" color="text.secondary">No past interviews.</Typography></Box>)}
        </Box>
      </Container>
    </Box>
  );
};

export default Interviews;
