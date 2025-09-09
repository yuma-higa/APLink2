import React from 'react';
import { Card, CardContent, CardActions, Avatar, Box, Chip, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Email, OpenInNew } from '@mui/icons-material';
import type { StudentSummary } from '../../types/student';

interface Props {
  student: StudentSummary;
  onView: (student: StudentSummary) => void;
  onMessage: (student: StudentSummary) => void;
}

const StudentCard: React.FC<Props> = ({ student, onView, onMessage }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar src={student.profileImageUrl} alt={student.name} sx={{ width: 56, height: 56 }}>
            {student.name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{student.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {student.major || '—'}{student.year ? ` • ${student.year}` : ''}
            </Typography>
          </Box>
          {student.hasApplied && (
            <Chip size="small" color="info" label="Applied" />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Chip size="small" label={`GPA ${student.gpa ?? '—'}`} />
          {student.linkedin && (
            <Tooltip title="LinkedIn">
              <IconButton size="small" component="a" href={student.linkedin} target="_blank" rel="noreferrer">
                <OpenInNew fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          {student.github && (
            <Tooltip title="GitHub">
              <IconButton size="small" component="a" href={student.github} target="_blank" rel="noreferrer">
                <OpenInNew fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
          {student.bio || 'No bio provided.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(student.skills || []).slice(0, 6).map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button size="small" onClick={() => onView(student)}>View Profile</Button>
        <Button size="small" variant="contained" startIcon={<Email />} onClick={() => onMessage(student)}>
          Message
        </Button>
      </CardActions>
    </Card>
  );
};

export default StudentCard;
