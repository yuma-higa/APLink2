import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Tooltip,
  Stack,
  Tabs,
  Tab,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Edit,
  Save,
  Cancel,
  CloudUpload,
  Business,
  LocationOn,
  Language,
  Email,
  CalendarToday,
  Groups,
  Category,
  Description
} from '@mui/icons-material';
import Header from '../../layouts/Header'

interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  description: string;
  industry: string;
  location: string;
  website?: string;
  logoUrl?: string;
  size?: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
}

const CompanyProfileEditPage: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({});

  // UI state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);

  const changedKeys: (keyof CompanyProfile)[] = useMemo(
    () => ['name','email','description','industry','location','website','logoUrl','size','foundedYear'],
    []
  );

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return changedKeys.some(k => formData[k] !== profile[k]);
  }, [formData, profile, changedKeys]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Check if backend is available
        const API_BASE_URL = 'http://localhost:3000';
        
        // First check if backend is running
        try {
          console.log('Attempting to fetch company profile from database...');
          const healthCheck = await fetch(`${API_BASE_URL}/company/debug/user`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Health check response status:', healthCheck.status);
          if (healthCheck.ok) {
            const debugData = await healthCheck.json();
            console.log('Debug user data:', debugData);
            
            // Backend is running, try to get profile
            const response = await fetch(`${API_BASE_URL}/company/profile`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Profile fetch response status:', response.status);
            if (response.ok) {
              const profileData = await response.json();
              console.log('✅ Successfully fetched profile from database:', profileData);
              setProfile(profileData);
              setFormData(profileData);
              setLoading(false);
              return;
            } else {
              const errorText = await response.text();
              console.log('❌ Profile fetch failed:', response.status, errorText);
            }
          } else {
            const errorText = await healthCheck.text();
            console.log('❌ Health check failed:', healthCheck.status, errorText);
          }
        } catch (backendError) {
          console.log('❌ Backend connection error:', backendError);
        }
        
      } catch (error) {
        console.error('Error fetching profile from API:', error);
      }
      
      // Do not silently fallback to mock; surface error instead
      setError('Failed to load company profile from server. Please ensure you are logged in and the backend is running.');
      setLoading(false);
    };

    fetchProfile().finally(() => setLoading(false));
  }, []);

  const handleInputChange = (field: keyof CompanyProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setError(null);
    
    try {
      const API_BASE_URL = 'http://localhost:3000';
      
      // Try to update via backend API
      try {
        console.log('💾 Attempting to save profile to database...');
        console.log('Sending profile update data:', formData);

        // Send only changed fields to minimize payload size (avoid 413)
        const keys: (keyof CompanyProfile)[] = [
          'name','email','description','industry','location','website','logoUrl','size','foundedYear'
        ];
        const updatePayload: Partial<CompanyProfile> = {};
        if (profile) {
          keys.forEach((k) => {
            const nextVal = formData[k];
            const prevVal = profile[k];
            if (nextVal !== prevVal && nextVal !== undefined) {
              // Type assertion is safe here as we're only setting defined properties
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (updatePayload as Record<string, any>)[k] = nextVal;
            }
          });
        }

        if (Object.keys(updatePayload).length === 0) {
          setEditMode(false);
          setSuccess('No changes to save.');
          setTimeout(() => setSuccess(null), 2000);
          setSaving(false);
          return;
        }

        // Guard: if logo included but too large, block with a helpful error
        if (updatePayload.logoUrl && typeof updatePayload.logoUrl === 'string') {
          const approx = (updatePayload.logoUrl.split(',')[1] || '').length;
          const estBytes = Math.ceil((approx * 3) / 4);
          if (estBytes > MAX_LOGO_FILE_BYTES) {
            setError('Logo is too large to upload. Please choose a smaller image.');
            setSaving(false);
            return;
          }
        }

        const response = await fetch(`${API_BASE_URL}/company/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });
        
        console.log('Save response status:', response.status);
        if (response.ok) {
          const updatedProfile = await response.json();
          console.log('✅ Successfully saved profile to database:', updatedProfile);
          setProfile(updatedProfile);
          setEditMode(false);
          setSuccess('✅ Company profile updated successfully in database!');
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
          setSaving(false);
          return;
        } else {
          const errorText = await response.text();
          console.log('❌ Save failed:', response.status, errorText);
        }
      } catch (apiError) {
        console.log('❌ API save error:', apiError);
      }
      
      // Do not silently fallback to local save; show error
      setError('Failed to save profile. Please check your session and input, then try again.');

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditMode(false);
    setError(null);
  };

  const MAX_LOGO_FILE_BYTES = 90 * 1024; // ~90KB to stay within common JSON parser limits
  const MAX_LOGO_DIMENSION = 512; // longest side

  const dataUrlSizeBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.ceil((base64.length * 3) / 4);
  };

  const downscaleImageToDataUrl = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img as HTMLImageElement;
        const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unsupported'));
        ctx.drawImage(img, 0, 0, width, height);
        const jpeg = canvas.toDataURL('image/jpeg', 0.75);
        resolve(jpeg);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = src;
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { // 2MB hard limit
      setError('Logo is too large. Please choose an image under 2MB.');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const original = (e.target?.result as string) || '';
        let output = original;
        if (dataUrlSizeBytes(output) > MAX_LOGO_FILE_BYTES) {
          try {
            output = await downscaleImageToDataUrl(original);
          } catch (err) {
            console.warn('Downscale failed:', err);
          }
        }
        if (dataUrlSizeBytes(output) > MAX_LOGO_FILE_BYTES) {
          setError('Optimized logo still too large. Try a smaller image.');
          return;
        }
        handleInputChange('logoUrl', output);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Logo upload failed:', err);
      setError('Logo upload failed. Please try a different image.');
    }
  };

  const truncateDescription = (text: string, words: number = 35) => {
    const wordArray = text.split(' ');
    if (wordArray.length <= words) return text;
    return wordArray.slice(0, words).join(' ') + '...';
  };
  
  const {user, getUserRole} = useAuth();
  const userName: string | undefined = user ?? undefined;
  const userRole: string | undefined = getUserRole ? getUserRole() ?? undefined : undefined;
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Company profile not found</Alert>
      </Container>
    );
  }

  return (
    <>
    <Header userName={userName} userRole={userRole} />
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8, px: { xs: 2, md: 4 } }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Header */}
      <Box
        sx={{
          mb: 4,
          px: { xs: 2, md: 3 },
          py: 2,
        }}
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        gap={3}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{color: theme.palette.primary.main}}>
            Company Profile
          </Typography>
          {editMode && hasChanges && <Chip color="warning" size="small" label="Edited" />}
        </Box>
      </Box>

      {/* On desktop, show both columns; on mobile, organize via tabs */}
      {!isMobile && (
        <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
          {/* Main Profile Information */}
          <Box flex={2}>
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardHeader
                title="Company Information"
                sx={{
                  pb: 0,
                  '& .MuiCardHeader-title': { fontWeight: 700 },
                  '& .MuiCardHeader-subheader': { color: 'text.secondary' }
                }}
              />
              <CardContent sx={{ pt: 2 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Company Name */}
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Business sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={editMode ? formData.name || '' : profile.name}
                      onChange={(e) => editMode && handleInputChange('name', e.target.value)}
                      disabled={!editMode}
                      variant={editMode ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !editMode
                      }}
                    />
                  </Box>

                  {/* Email and Website Row */}
                  <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
                    <Box display="flex" alignItems="flex-start" gap={1} sx={{ flex: 1 }}>
                      <Email sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={editMode ? formData.email || '' : profile.email}
                        onChange={(e) => editMode && handleInputChange('email', e.target.value)}
                        disabled={!editMode}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode
                        }}
                        helperText={editMode ? 'Use a contact email students can reach.' : ' '}
                      />
                    </Box>

                    <Box display="flex" alignItems="flex-start" gap={1} sx={{ flex: 1 }}>
                      <Language sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                      <TextField
                        fullWidth
                        label="Website"
                        value={editMode ? formData.website || '' : profile.website || ''}
                        onChange={(e) => editMode && handleInputChange('website', e.target.value)}
                        disabled={!editMode}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode
                        }}
                        placeholder="https://example.com"
                        
                      />
                    </Box>
                  </Box>

                  {/* Industry and Location Row */}
                  <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
                    <Box display="flex" alignItems="flex-start" gap={1} sx={{ flex: 1 }}>
                      <Category sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                      <TextField
                        fullWidth
                        label="Industry"
                        value={editMode ? formData.industry || '' : profile.industry}
                        onChange={(e) => editMode && handleInputChange('industry', e.target.value)}
                        disabled={!editMode}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode
                        }}
                        placeholder="e.g., Technology"
                      />
                    </Box>

                    <Box display="flex" alignItems="flex-start" gap={1} sx={{ flex: 1 }}>
                      <LocationOn sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                      <TextField
                        fullWidth
                        label="Location"
                        value={editMode ? formData.location || '' : profile.location}
                        onChange={(e) => editMode && handleInputChange('location', e.target.value)}
                        disabled={!editMode}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode
                        }}
                        placeholder="City, Country"
                      />
                    </Box>
                  </Box>

                  {/* Company Size and Founded Year Row */}
                  <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
                    <Box display="flex" alignItems="flex-start" gap={1} sx={{ flex: 1 }}>
                      <Groups sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                      <TextField
                        fullWidth
                        label="Company Size"
                        value={editMode ? formData.size || '' : profile.size || ''}
                        onChange={(e) => editMode && handleInputChange('size', e.target.value)}
                        disabled={!editMode}
                        variant={editMode ? 'outlined' : 'filled'}
                        placeholder="e.g., 1-10 employees, 11-50 employees"
                        InputProps={{
                          readOnly: !editMode
                        }}
             
                      />
                    </Box>

                    <Box display="flex" alignItems="flex-start" gap={1} sx={{ flex: 1 }}>
                      <CalendarToday sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                      <TextField
                        fullWidth
                        label="Founded Year"
                        type="number"
                        value={editMode ? (formData.foundedYear ?? '') : (profile.foundedYear ?? '')}
                        onChange={(e) => {
                          if (!editMode) return;
                          const raw = e.target.value;
                          if (raw === '') {
                            handleInputChange('foundedYear', undefined as unknown as number);
                            return;
                          }
                          const num = parseInt(raw, 10);
                          if (!Number.isNaN(num)) {
                            handleInputChange('foundedYear', num);
                          }
                        }}
                        disabled={!editMode}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode
                        }}
                      
                      />
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Description sx={{ mt: 2, color: 'text.secondary', fontSize: 20 }} />
                    <TextField
                      fullWidth
                      label="Company Description"
                      multiline
                      rows={editMode ? 6 : 4}
                      value={editMode ? formData.description || '' : profile.description}
                      onChange={(e) => editMode && handleInputChange('description', e.target.value)}
                      disabled={!editMode}
                      variant={editMode ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !editMode
                      }}
                      helperText={editMode ? `${(formData.description || '').length} characters • ${(formData.description || '').split(' ').filter(Boolean).length} words` : ''}
                    />
                  </Box>

                  {/* Edit Profile Button */}
                  <Box sx={{ pt: 2 }}>
                    {!editMode ? (
                      <Button 
                        variant="contained" 
                        size="medium" 
                        startIcon={<Edit />} 
                        onClick={() => setEditMode(true)}
                        sx={{ borderRadius: 0 }}
                        fullWidth
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <Tooltip title={hasChanges ? '' : 'No changes to save'}>
                          <span style={{ flex: 1 }}>
                            <Button
                              variant="contained"
                              size="medium"
                              startIcon={<Save />}
                              onClick={handleSave}
                              disabled={saving || !hasChanges}
                              sx={{ borderRadius: 0 }}
                              fullWidth
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </span>
                        </Tooltip>
                        <Button 
                          variant="outlined" 
                          size="medium" 
                          startIcon={<Cancel />} 
                          onClick={handleCancel} 
                          disabled={saving}
                          sx={{ borderRadius: 0, flex: 1 }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Logo and Preview */}
          <Box flex={1}>
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardHeader
                title="Branding"
                subheader="Logo and student preview"
                sx={{
                  pb: 0,
                  '& .MuiCardHeader-title': { fontWeight: 700 }
                }}
              />
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Company Logo
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar
                    src={editMode ? formData.logoUrl : profile.logoUrl}
                    sx={{ width: 120, height: 120, border: '3px solid', borderColor: 'divider', boxShadow: 2 }}
                  >
                    {(editMode ? formData.name : profile.name)?.charAt(0)}
                  </Avatar>
                  
                  {editMode && (
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoUpload}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                        >
                          Upload Logo
                        </Button>
                      </label>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  PNG or JPG, up to ~90KB after optimization. Larger files will be compressed or rejected.
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Student View Preview
                </Typography>
                
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    background: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                    borderRadius: 2
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar
                      src={editMode ? formData.logoUrl : profile.logoUrl}
                      sx={{ width: 48, height: 48 }}
                    >
                      {(editMode ? formData.name : profile.name)?.charAt(0)}
                    </Avatar>
                    
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                        {editMode ? formData.name : profile.name}
                      </Typography>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip size="small" color="primary" variant="outlined" label={(editMode ? formData.industry : profile.industry) || 'Industry'} />
                        <Chip size="small" color="secondary" variant="outlined" label={(editMode ? formData.location : profile.location) || 'Location'} />
                      </Stack>
                      
                      <Typography variant="body2">
                        {truncateDescription(editMode ? formData.description || '' : profile.description)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  This is how your company will appear to students in search results
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {isMobile && (
        <>
          <Paper elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Details" />
              <Tab label="Branding & Preview" />
            </Tabs>
          </Paper>

          {tab === 0 && (
            <Box>
              {/* Reuse the same Details card */}
              <Box>
                <Box>
                  {/* We render the same content as desktop Details section by duplicating structure for clarity */}
                  <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <CardHeader
                      title="Company Information"
                      subheader="Keep your company details up to date for students"
                      sx={{
                        pb: 0,
                        '& .MuiCardHeader-title': { fontWeight: 700 },
                        '& .MuiCardHeader-subheader': { color: 'text.secondary' }
                      }}
                    />
                    <CardContent sx={{ pt: 2 }}>
                      <Box display="flex" flexDirection="column" gap={3}>
                        <TextField fullWidth label="Company Name" value={editMode ? formData.name || '' : profile.name} onChange={(e) => editMode && handleInputChange('name', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} InputProps={{ readOnly: !editMode, startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                        <TextField fullWidth label="Email" type="email" value={editMode ? formData.email || '' : profile.email} onChange={(e) => editMode && handleInputChange('email', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} InputProps={{ readOnly: !editMode, startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }} helperText={editMode ? 'Use a contact email students can reach.' : ' '} />
                        <TextField fullWidth label="Website" value={editMode ? formData.website || '' : profile.website || ''} onChange={(e) => editMode && handleInputChange('website', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} InputProps={{ readOnly: !editMode, startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} /> }} placeholder="https://example.com" helperText={editMode ? 'Include https:// for clickable links.' : ' '} />
                        <TextField fullWidth label="Industry" value={editMode ? formData.industry || '' : profile.industry} onChange={(e) => editMode && handleInputChange('industry', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} placeholder="e.g., Technology" />
                        <TextField fullWidth label="Location" value={editMode ? formData.location || '' : profile.location} onChange={(e) => editMode && handleInputChange('location', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} placeholder="City, Country" />
                        <TextField fullWidth label="Company Size" value={editMode ? formData.size || '' : profile.size || ''} onChange={(e) => editMode && handleInputChange('size', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} placeholder="e.g., 1-10 employees, 11-50 employees" helperText={editMode ? 'Rough range is fine.' : ' '} />
                        <TextField fullWidth label="Founded Year" type="number" value={editMode ? (formData.foundedYear ?? '') : (profile.foundedYear ?? '')} onChange={(e) => { if (!editMode) return; const raw = e.target.value; if (raw === '') { handleInputChange('foundedYear', undefined as unknown as number); return; } const num = parseInt(raw, 10); if (!Number.isNaN(num)) { handleInputChange('foundedYear', num); } }} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} helperText={editMode ? 'YYYY format (e.g., 2015).' : ' '} />
                        <TextField fullWidth label="Company Description" multiline rows={editMode ? 6 : 4} value={editMode ? formData.description || '' : profile.description} onChange={(e) => editMode && handleInputChange('description', e.target.value)} disabled={!editMode} variant={editMode ? 'outlined' : 'filled'} helperText={editMode ? `${(formData.description || '').length} characters • ${(formData.description || '').split(' ').filter(Boolean).length} words` : ''} />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardHeader title="Branding & Preview" sx={{ pb: 0, '& .MuiCardHeader-title': { fontWeight: 700 } }} />
                <CardContent sx={{ pt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Company Logo
                  </Typography>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar src={editMode ? formData.logoUrl : profile.logoUrl} sx={{ width: 120, height: 120, border: '3px solid', borderColor: 'divider', boxShadow: 2 }}>
                      {(editMode ? formData.name : profile.name)?.charAt(0)}
                    </Avatar>
                    {editMode && (
                      <Box>
                        <input accept="image/*" style={{ display: 'none' }} id="logo-upload-mobile" type="file" onChange={handleLogoUpload} />
                        <label htmlFor="logo-upload-mobile">
                          <Button variant="outlined" component="span" startIcon={<CloudUpload />}>Upload Logo</Button>
                        </label>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    PNG or JPG, up to ~90KB after optimization.
                  </Typography>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Student View Preview
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Avatar src={editMode ? formData.logoUrl : profile.logoUrl} sx={{ width: 48, height: 48 }}>
                        {(editMode ? formData.name : profile.name)?.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                          {editMode ? formData.name : profile.name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip size="small" color="primary" variant="outlined" label={(editMode ? formData.industry : profile.industry) || 'Industry'} />
                          <Chip size="small" color="secondary" variant="outlined" label={(editMode ? formData.location : profile.location) || 'Location'} />
                        </Stack>
                        <Typography variant="body2">{truncateDescription(editMode ? formData.description || '' : profile.description)}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </CardContent>
              </Card>
            </Box>
          )}

          {editMode && (
            <Paper
              elevation={3}
              sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                px: 2,
                py: 1.5,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1200
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {hasChanges ? 'You have unsaved changes' : 'No changes'}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving || !hasChanges}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Container>
  </>
  );
};

export default CompanyProfileEditPage;

