import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Toolbar,
  TextField,
  Stack,
  DialogContentText,
  Grid,
} from '@mui/material';
import { Event as EventIcon, AccessTime as AccessTimeIcon, Timer as TimerIcon, Title as TitleIcon, Description as DescriptionIcon, CheckCircleOutline, CancelOutlined, InfoOutlined } from '@mui/icons-material';
import { Edit, Visibility, Email } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import type { Student } from '../../types/dashboard';

interface StudentTableProps {
  students: Student[];
  onStatusChange: (studentId: number, newStatus: Student['status']) => void;
  onViewDetails: (student: Student) => void;
  onSendEmail: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onStatusChange,
  onViewDetails,
  onSendEmail
}) => {
  const [editDialog, setEditDialog] = useState<{ open: boolean; student: Student | null }>({
    open: false,
    student: null
  });
  const [newStatus, setNewStatus] = useState<Student['status']>('Applied');
  const [statusFilter, setStatusFilter] = useState<'' | Student['status']>('');
  const [query, setQuery] = useState('');
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; applicationId?: number }>({ open: false });
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<number>(30);
  const [title, setTitle] = useState<string>('Interview');
  const [description, setDescription] = useState<string>('');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  const isValidTime = (v: string) => /^\d{2}:\d{2}$/.test(v);
  const canPropose = !!scheduleDialog.applicationId && !!scheduleDate && isValidTime(scheduleTime) && duration > 0 && !!title.trim();

  const counts = useMemo(() => {
    const c: Record<string, number> = { Applied: 0, Interviewing: 0, Offered: 0, Hired: 0, Rejected: 0 };
    students.forEach(s => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const statusOk = !statusFilter || s.status === statusFilter;
      const q = query.trim().toLowerCase();
      const queryOk = !q || `${s.name} ${s.major} ${s.year}`.toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [students, statusFilter, query]);

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'Applied': return 'primary';
      case 'Interviewing': return 'warning';
      case 'Offered': return 'info';
      case 'Hired': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const handleEditClick = (student: Student) => {
    setEditDialog({ open: true, student });
    setNewStatus(student.status);
  };

  const handleSaveStatus = () => {
    if (editDialog.student) {
      onStatusChange(editDialog.student.id, newStatus);
      setEditDialog({ open: false, student: null });
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6">Applicant Management</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`Applied ${counts.Applied || 0}`} color="primary" variant={statusFilter==='Applied'?'filled':'outlined'} onClick={() => setStatusFilter(statusFilter==='Applied'?'': 'Applied')} />
              <Chip label={`Interviewing ${counts.Interviewing || 0}`} color="warning" variant={statusFilter==='Interviewing'?'filled':'outlined'} onClick={() => setStatusFilter(statusFilter==='Interviewing'?'': 'Interviewing')} />
              <Chip label={`Offered ${counts.Offered || 0}`} color="info" variant={statusFilter==='Offered'?'filled':'outlined'} onClick={() => setStatusFilter(statusFilter==='Offered'?'': 'Offered')} />
              <Chip label={`Hired ${counts.Hired || 0}`} color="success" variant={statusFilter==='Hired'?'filled':'outlined'} onClick={() => setStatusFilter(statusFilter==='Hired'?'': 'Hired')} />
              <Chip label={`Rejected ${counts.Rejected || 0}`} color="error" variant={statusFilter==='Rejected'?'filled':'outlined'} onClick={() => setStatusFilter(statusFilter==='Rejected'?'': 'Rejected')} />
            </Stack>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField size="small" placeholder="Search name, major, year" value={query} onChange={e => setQuery(e.target.value)} />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Interviewing">Interviewing</MenuItem>
                  <MenuItem value="Offered">Offered</MenuItem>
                  <MenuItem value="Hired">Hired</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Major</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>GPA</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={(student as any).profileImageUrl || undefined} sx={{ width: 28, height: 28 }}>
                          {student.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {student.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{student.major}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={parseFloat(student.gpa) >= 3.5 ? 'success.main' : 'text.primary'}
                      >
                        {student.gpa}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.status} 
                        color={getStatusColor(student.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {student.appliedDate}
                      </Typography>
                    </TableCell>
                  <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => onViewDetails(student)}
                          title="View Details"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(student)}
                          title="Edit Status"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onSendEmail(student)}
                          title="Send Email"
                        >
                          <Email fontSize="small" />
                        </IconButton>
                        <Button size="small" variant="outlined" onClick={() => setScheduleDialog({ open: true, applicationId: student.id })}>
                          Schedule
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, student: null })}>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Student: {editDialog.student?.name}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value as Student['status'])}
              >
                <MenuItem value="Applied">Applied</MenuItem>
                <MenuItem value="Interviewing">Interviewing</MenuItem>
                <MenuItem value="Offered">Offered</MenuItem>
                <MenuItem value="Hired">Hired</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, student: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveStatus} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={scheduleDialog.open} onClose={() => setScheduleDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack spacing={0.5}>
            <Typography variant="h6">Propose Interview Time</Typography>
            <Typography variant="body2" color="text.secondary">Pick a date/time to propose to the student. They will confirm on their side.</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {(() => {
                const hiddenRef = hiddenDateInputRef;
                const display = scheduleDate
                  ? new Date(`${scheduleDate}T00:00:00`).toLocaleDateString('en-CA')
                  : '';
                return (
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventIcon fontSize="small" /> Date</Box>}
                      value={display}
                      placeholder="YYYY-MM-DD"
                      onClick={() => hiddenRef.current?.showPicker ? hiddenRef.current.showPicker() : hiddenRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hiddenRef.current?.click(); } }}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      helperText={' '}
                    />
                    <input
                      ref={hiddenRef}
                      type="date"
                      lang="en"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    />
                  </Box>
                );
              })()}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessTimeIcon fontSize="small" /> Time</Box>}
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                error={!!scheduleTime && !isValidTime(scheduleTime)}
                helperText={!!scheduleTime && !isValidTime(scheduleTime) ? 'Use HH:MM (24h)' : ' '}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TimerIcon fontSize="small" /> Duration (minutes)</Box>}
                type="number"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value || '30', 10))}
                fullWidth
                inputProps={{ min: 5, step: 5 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TitleIcon fontSize="small" /> Title</Box>}
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DescriptionIcon fontSize="small" /> Description</Box>}
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                multiline rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                <InfoOutlined fontSize="small" />
                <Typography variant="caption">All times shown in your timezone:</Typography>
                <Typography variant="caption" fontWeight={600}>{tz}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CancelOutlined />} onClick={() => setScheduleDialog({ open: false })}>Cancel</Button>
          <Button
            startIcon={<CheckCircleOutline />}
            variant="contained"
            disabled={!canPropose}
            onClick={async () => {
              if (!scheduleDialog.applicationId) return;
              const iso = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
              try {
                const mod = await import('../../services/companyApi');
                await mod.companyApiService.proposeInterview({
                  applicationId: String(scheduleDialog.applicationId),
                  title: title.trim(),
                  description,
                  scheduledAt: iso,
                  duration,
                });
              } finally {
                setScheduleDialog({ open: false });
                setScheduleDate('');
                setScheduleTime('09:00');
                setDuration(30);
                setTitle('Interview');
                setDescription('');
              }
            }}
          >
            Propose
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentTable;
