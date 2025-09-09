import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { companyApiService } from '../../services/companyApi';

interface JobForm {
  title: string;
  description: string;
  requirements: string; // comma separated
  type: string;
  location: string;
  salary?: string;
}

const emptyForm: JobForm = {
  title: '', description: '', requirements: '', type: '', location: '', salary: ''
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Intern'];

const JobPosting: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await companyApiService.getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleOpenEdit = (job: any) => {
    setEditing(job);
    setForm({
      title: job.title || '',
      description: job.description || '',
      requirements: (job.requirements || []).join(', '),
      type: job.type || '',
      location: job.location || '',
      salary: job.salary || ''
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
      type: form.type.trim(),
      location: form.location.trim(),
      salary: form.salary?.trim() || undefined
    };
    if (editing) {
      await companyApiService.updateJob(editing.id, payload);
    } else {
      await companyApiService.createJob(payload);
    }
    setOpen(false);
    await fetchJobs();
  };

  const toggleActive = async (job: any) => {
    await companyApiService.setJobActive(job.id, !job.isActive);
    await fetchJobs();
  };

  const remove = async (job: any) => {
    if (!confirm('Delete this job?')) return;
    await companyApiService.deleteJob(job.id);
    await fetchJobs();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Job Postings</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>New Job</Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {jobs.map(job => (
          <Card key={job.id}>
            <CardHeader
              title={job.title}
              subheader={`${job.type} • ${job.location}`}
              action={<Chip size="small" label={job.isActive ? 'Active' : 'Inactive'} color={job.isActive ? 'success' as any : 'default'} />}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{job.description}</Typography>
              {(job.requirements || []).length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {job.requirements.map((r: string) => <Chip key={r} label={r} size="small" />)}
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => handleOpenEdit(job)}>Edit</Button>
                <Button size="small" onClick={() => toggleActive(job)}>{job.isActive ? 'Deactivate' : 'Activate'}</Button>
                <Button size="small" color="error" onClick={() => remove(job)}>Delete</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {!loading && jobs.length === 0 && (
          <Box><Typography variant="body2" color="text.secondary">No jobs yet.</Typography></Box>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Job' : 'Create Job'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={3} />
            <TextField label="Requirements (comma separated)" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="job-type-label">Job Type</InputLabel>
              <Select
                labelId="job-type-label"
                label="Job Type"
                value={form.type}
                onChange={e => setForm({ ...form, type: String(e.target.value) })}
              >
                {JOB_TYPES.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
            <TextField label="Salary (optional)" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobPosting;
