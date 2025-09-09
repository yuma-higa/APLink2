import React from 'react';
import { Card, CardContent, CardHeader, Avatar, Typography, Box, Chip, Button, IconButton, Tooltip, Divider } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface Company {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  size?: string;
  foundedYear?: number;
  activeJobs?: number;
}

interface Props {
  company: Company;
  jobs?: Array<{ id: string; title: string; type: string; location: string }>;
  onApply?: (companyId: string, jobId: string) => void;
  applyDisabled?: boolean;
  disabledJobIds?: string[];
}

const CompanyCard: React.FC<Props> = ({ company, jobs, onApply, applyDisabled, disabledJobIds }) => {
  const initials = company.name?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar src={company.logoUrl} alt={company.name} sx={{ bgcolor: 'primary.main' }}>
            {initials}
          </Avatar>
        }
        title={company.name}
        subheader={[company.industry, company.location].filter(Boolean).join(' • ')}
      />
      <CardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {company.description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {company.description}
          </Typography>
        )}
        {Array.isArray(jobs) && jobs.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Open Jobs</Typography>
            {jobs.slice(0, 3).map((job) => (
              <Box key={job.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Box>
                  <Typography variant="body2">{job.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{job.type} • {job.location}</Typography>
                </Box>
                {onApply && (
                  <Button size="small" variant="outlined" disabled={applyDisabled || (disabledJobIds?.includes(job.id) ?? false)} onClick={() => onApply(company.id, job.id)}>Apply</Button>
                )}
              </Box>
            ))}
            {jobs.length > 3 && (
              <Typography variant="caption" color="text.secondary">and {jobs.length - 3} more…</Typography>
            )}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 'auto' }}>
          {typeof company.activeJobs === 'number' && (
            <Chip size="small" label={`${company.activeJobs} open`} color="info" />
          )}
          {company.size && <Chip size="small" label={company.size} />}
          {company.foundedYear && <Chip size="small" label={`Since ${company.foundedYear}`} />}
          {company.website && (
            <Tooltip title="Website">
              <IconButton size="small" component="a" href={company.website} target="_blank" rel="noreferrer">
                <OpenInNew fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={`/student/companies/${company.id}`}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
