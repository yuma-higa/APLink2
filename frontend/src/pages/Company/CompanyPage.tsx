import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Stack } from '@mui/material';
import Header from "../../layouts/Header";
import { useAuth } from '../../hooks/useAuth';
import { companyApiService } from '../../services/companyApi';
import StudentCard from '../../components/Company/StudentCard';
import { useNavigate } from 'react-router-dom';
import type { StudentSummary } from '../../types/student';

const CompanyPage: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const navigate = useNavigate();
  
  const userName = user || 'guest';
  const userRole = getUserRole() || 'COMPANY';

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StudentSummary | null>(null);
  const [major, setMajor] = useState('');

  const filters = useMemo(() => ({ search, major }), [search, major]);

  useEffect(() => {
    let ignore = false;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await companyApiService.searchStudents(filters);
        if (!ignore) setStudents(data);
      } catch (e) {
        if (!ignore) setStudents([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchStudents();
    return () => { ignore = true; };
  }, [filters]);

  const handleMessage = async (s: StudentSummary) => {
    if (!s.id) return;
    // Jump to Dashboard Messages with this student preselected
    navigate(`/company/Dashboard?tab=messages&studentId=${encodeURIComponent(s.id)}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Discover Students</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Search students"
            placeholder="Name, email, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            size="small"
            label="Major"
            placeholder="e.g. Computer Science"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' } }}>
          {students.map((s) => (
            <Box key={s.id}>
              <StudentCard student={s} onView={setSelected} onMessage={handleMessage} />
            </Box>
          ))}
          {!loading && students.length === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary">No students found.</Typography>
            </Box>
          )}
        </Box>
      </Container>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Profile</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography variant="h6">{selected.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selected.major || '—')}{selected.year ? ` • ${selected.year}` : ''} • GPA {selected.gpa ?? '—'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selected.bio || 'No bio provided.'}</Typography>

              {(selected.skills?.length ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {selected.skills!.map((sk) => (
                    <Chip key={sk} label={sk} size="small" />
                  ))}
                </Stack>
              ) : null)}

              {selected.applicationHistory?.length ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Application History with your company</Typography>
                  {selected.applicationHistory!.map((ah) => (
                    <Box key={ah.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                      <Chip size="small" label={ah.status} />
                      <Typography variant="body2" color="text.secondary">
                        {ah.job?.title ? `${ah.job.title} • ` : ''}{new Date(ah.appliedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selected && (
            <Button variant="contained" onClick={() => handleMessage(selected)}>Message</Button>
          )}
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyPage;
