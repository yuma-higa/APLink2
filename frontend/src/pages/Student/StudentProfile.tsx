import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, Avatar, Stack, Autocomplete } from '@mui/material';
import { MAJORS } from '../../constants/majors';
import Header from '../../layouts/Header';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../services/studentApi';

const StudentProfile: React.FC = () => {
  const { user, getUserRole } = useAuth();
  const userName = user || 'student';
  const userRole = getUserRole() || 'STUDENT';

  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await studentApi.getProfile();
        if (!ignore) setForm(data);
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load profile');
      }
    })();
    return () => { ignore = true; };
  }, []);

  const update = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));

  const onSave = async () => {
    try {
      setError(null);
      await studentApi.updateProfile({
        name: form.name,
        major: form.major,
        year: form.year,
        gpa: form.gpa,
        skills: form.skills,
        bio: form.bio,
        linkedin: form.linkedin,
        github: form.github,
        profileImageUrl: form.profileImageUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await studentApi.uploadProfileImage(file);
      update('profileImageUrl', url);
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header userName={userName} userRole={userRole} />
      <Container sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Edit Profile</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Saved</Alert>}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2
        }}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={form.profileImageUrl} sx={{ width: 72, height: 72 }}>
                {form.name?.[0]?.toUpperCase()}
              </Avatar>
              <label>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
                <Button variant="outlined" component="span">Upload Profile Image</Button>
              </label>
              {form.profileImageUrl && (
                <Typography variant="body2" color="text.secondary">{form.profileImageUrl}</Typography>
              )}
            </Stack>
          </Box>
          <TextField fullWidth label="Name" value={form.name || ''} onChange={e => update('name', e.target.value)} />
          <Autocomplete
            freeSolo
            options={MAJORS}
            value={form.major || ''}
            onInputChange={(_, v) => update('major', v)}
            renderInput={(params) => (
              <TextField {...params} label="Major (optional)" placeholder="Start typing to search majors" />
            )}
          />
          <TextField fullWidth label="Year" value={form.year || ''} onChange={e => update('year', e.target.value)} />
          <TextField fullWidth label="GPA" type="number" inputProps={{ step: '0.1' }} value={form.gpa ?? ''} onChange={e => update('gpa', parseFloat(e.target.value))} />
          <TextField fullWidth sx={{ gridColumn: '1 / -1' }} label="Skills (comma separated)" value={(form.skills || []).join(', ')} onChange={e => update('skills', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
          <TextField fullWidth sx={{ gridColumn: '1 / -1' }} multiline minRows={3} label="Bio" value={form.bio || ''} onChange={e => update('bio', e.target.value)} />
          <TextField fullWidth label="LinkedIn URL" value={form.linkedin || ''} onChange={e => update('linkedin', e.target.value)} />
          <TextField fullWidth label="GitHub URL" value={form.github || ''} onChange={e => update('github', e.target.value)} />
          <TextField fullWidth sx={{ gridColumn: '1 / -1' }} label="Profile Image URL" value={form.profileImageUrl || ''} onChange={e => update('profileImageUrl', e.target.value)} />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onSave}>Save Changes</Button>
        </Box>
      </Container>
    </Box>
  );
};

export default StudentProfile;
