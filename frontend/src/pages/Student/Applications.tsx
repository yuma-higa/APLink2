import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip } from '@mui/material';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';

const Applications: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await studentApi.getMyApplications();
        if (!ignore) setApps(data);
      } catch {
        if (!ignore) setApps([]);
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>My Applications</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {apps.map(a => (
            <Box key={a.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{a.company?.name || 'Company'}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.job?.title}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip size="small" label={a.status} color={a.status === 'HIRED' ? 'success' : a.status === 'REJECTED' ? 'error' : 'default'} />
                    <Typography variant="body2" color="text.secondary">Applied {new Date(a.appliedAt).toLocaleDateString()}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
          {apps.length === 0 && (
            <Box><Typography variant="body2" color="text.secondary">No applications yet.</Typography></Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Applications;
