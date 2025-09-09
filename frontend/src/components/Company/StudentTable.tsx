import React, { useMemo, useState } from 'react';
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
} from '@mui/material';
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
    </Box>
  );
};

export default StudentTable;
