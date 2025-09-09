import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Stack, Divider, Chip } from '@mui/material';
import { Event as EventIcon, AccessTime as AccessTimeIcon, Work as WorkIcon, Business as BusinessIcon, CheckCircleOutline, CancelOutlined, Link as LinkIcon, InfoOutlined } from '@mui/icons-material';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';

const Interviews: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [acceptId, setAcceptId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const [u, h, p] = await Promise.all([
        studentApi.getUpcomingInterviews(),
        studentApi.getInterviewHistory(),
        studentApi.getPendingInterviews(),
      ]);
      if (!ignore) { setUpcoming(u); setHistory(h); setPending(p); }
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

        <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>Pending Proposals</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {pending.map(i => (
            <Box key={i.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{i.title} • {i.application?.job?.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{i.company?.name} • {new Date(i.scheduledAt).toLocaleString()}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button variant="contained" size="small" onClick={() => setAcceptId(i.id)}>Agree</Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
          {pending.length === 0 && (<Box><Typography variant="body2" color="text.secondary">No pending interview proposals.</Typography></Box>)}
        </Box>

        <Dialog open={!!acceptId} onClose={() => setAcceptId(null)} maxWidth="sm" fullWidth>
          {(() => {
            const selected = pending.find(p => p.id === acceptId);
            const when = selected ? new Date(selected.scheduledAt) : null;
            return (
              <>
                <DialogTitle>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={selected?.company?.logoUrl || undefined}>
                      {(selected?.company?.name?.[0] || 'C').toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Confirm Interview</Typography>
                      <Typography variant="body2" color="text.secondary">Please review the details below</Typography>
                    </Box>
                  </Stack>
                </DialogTitle>
                <DialogContent dividers>
                  {selected ? (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={600}>{selected.company?.name}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selected.application?.job?.title || 'Interview'}</Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">{when ? when.toLocaleDateString() : ''}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {when ? when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          {selected.duration ? ` • ${selected.duration} min` : ''}
                        </Typography>
                        <Chip size="small" label={Intl.DateTimeFormat().resolvedOptions().timeZone} sx={{ ml: 1 }} />
                      </Stack>
                      {selected.meetingLink && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinkIcon fontSize="small" color="action" />
                          <a href={selected.meetingLink} target="_blank" rel="noreferrer">Meeting link</a>
                        </Stack>
                      )}
                      {selected.description && (
                        <Stack direction="row" spacing={1}>
                          <InfoOutlined fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">{selected.description}</Typography>
                        </Stack>
                      )}
                    </Stack>
                  ) : null}
                </DialogContent>
                <DialogActions>
                  <Button startIcon={<CancelOutlined />} onClick={() => setAcceptId(null)}>Not now</Button>
                  <Button startIcon={<CheckCircleOutline />} variant="contained" onClick={async () => {
                    if (!acceptId) return;
                    await studentApi.acceptInterview(acceptId);
                    setPending(prev => prev.filter(p => p.id !== acceptId));
                    const accepted = pending.find(p => p.id === acceptId);
                    if (accepted) setUpcoming(prev => [...prev, { ...accepted, status: 'SCHEDULED' }]);
                    setAcceptId(null);
                  }}>Agree</Button>
                </DialogActions>
              </>
            );
          })()}
        </Dialog>

      </Container>
    </Box>
  );
};

export default Interviews;
