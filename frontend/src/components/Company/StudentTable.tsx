import React, { useState } from 'react';
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
} from '@mui/material';
import { Edit, Visibility, Email } from '@mui/icons-material';
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Student Applications</Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length} total candidates
            </Typography>
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
                {students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {student.name}
                      </Typography>
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
