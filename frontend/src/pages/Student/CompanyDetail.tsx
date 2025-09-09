import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, TextField } from '@mui/material';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [company, setCompany] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    (async () => {
      try {
        const data = await studentApi.getCompanyDetails(id);
        if (!ignore) setCompany(data);
      } catch {
        // handle
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const handleApply = async (jobId: string) => {
    if (!id) return;
    try {
      await studentApi.createApplication({ companyId: id, jobId, coverLetter });
      navigate('/student/applications');
    } catch (e: any) {
      alert(e?.message || 'Failed to apply. You may have already applied.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        {!company ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{company.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{company.industry} • {company.location}</Typography>
            <Typography sx={{ mb: 3 }}>{company.description}</Typography>

            <Typography variant="h6" sx={{ mb: 1 }}>Open Positions</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              {(company.jobs || []).map((job: any) => {
                const existing = (company.myApplications || []).find((a: any) => a.job?.id === job.id);
                return (
                <Box key={job.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{job.type} • {job.location}</Typography>
                      <TextField fullWidth multiline minRows={2} sx={{ mt: 2 }} placeholder="Cover letter (optional)" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button onClick={() => handleApply(job.id)} variant="contained" disabled={!!existing}>
                          {existing ? 'Already Applied' : 'Apply'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );})}
              {(!company.jobs || company.jobs.length === 0) && (
                <Box><Typography variant="body2" color="text.secondary">No active jobs.</Typography></Box>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CompanyDetail;
