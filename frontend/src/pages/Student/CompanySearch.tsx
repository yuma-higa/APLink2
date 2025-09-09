import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, TextField, Typography, Skeleton, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';
import CompanyCard from '../../components/Student/CompanyCard';
import { useNavigate } from 'react-router-dom';

const CompanySearch: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [disabledJobIds, setDisabledJobIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>(() => ({ open: false, msg: '', type: 'success' }));
  const navigate = useNavigate();

  const filters = useMemo(() => ({ search, position, industry, location, jobType }), [search, position, industry, location, jobType]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await studentApi.searchCompanies(filters);
        if (!ignore) setCompanies(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setCompanies([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [filters]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Search Companies</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField size="small" label="Search" value={search} onChange={e => setSearch(e.target.value)} />
          <TextField size="small" label="Position" placeholder="e.g. Frontend Engineer" value={position} onChange={e => setPosition(e.target.value)} />
          <TextField size="small" label="Industry" value={industry} onChange={e => setIndustry(e.target.value)} />
          <TextField size="small" label="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="job-type">Job Type</InputLabel>
            <Select
              labelId="job-type"
              label="Job Type"
              value={jobType}
              onChange={(e) => setJobType(String(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Intern">Intern</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <Box key={`skeleton-${i}`}>
              <Skeleton variant="rounded" height={180} />
            </Box>
          ))}
          {!loading && companies.map(c => (
            <Box key={c.id}>
              <CompanyCard
                company={c}
                jobs={Array.isArray(c.jobs) ? c.jobs.map((j: any) => ({ id: j.id, title: j.title, type: j.type, location: j.location })) : []}
                applyDisabled={submitting}
                disabledJobIds={disabledJobIds}
                onApply={async (companyId, jobId) => {
                  try {
                    setSubmitting(true);
                    // Create application silently
                    await studentApi.createApplication({ companyId, jobId });
                    // Send an auto message to company
                    await studentApi.sendMessage({ companyId, content: 'Hello, I just applied to your job posting. Looking forward to hearing from you!' });
                    setToast({ open: true, msg: 'Applied and message sent.', type: 'success' });
                    setDisabledJobIds(prev => [...new Set([...prev, jobId])]);
                    // Navigate to messages and preselect this company
                    navigate(`/student/messages?companyId=${companyId}`);
                  } catch (e: any) {
                    const msg = e?.message || 'Failed to apply. Please try again.';
                    setToast({ open: true, msg, type: 'error' });
                    if (String(msg).toLowerCase().includes('already applied')) {
                      setDisabledJobIds(prev => [...new Set([...prev, jobId])]);
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
            </Box>
          ))}
          {!loading && companies.length === 0 && (
            <Box><Typography variant="body2" color="text.secondary">No companies found.</Typography></Box>
          )}
        </Box>
        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.type} sx={{ width: '100%' }}>
            {toast.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

// Apply helper at module scope not needed

export default CompanySearch;
