import React from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Container, Card, CardContent } from '@mui/material';
// Replaced Grid with simple CSS grid via Box
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const StudentPage: React.FC = () => {
  const { handleLogout, user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            APLink - Student Dashboard
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Dashboard
        </Typography>
        
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {/* Company search */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Discover Companies</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Find companies and filter by position, industry, and location.
                </Typography>
                <Button component={RouterLink} to="/student/companies" variant="contained" color="primary" fullWidth>
                  Browse Companies
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Applications */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>My Applications</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Track your status with each company and role.
                </Typography>
                <Button component={RouterLink} to="/student/applications" variant="contained" color="secondary" fullWidth>
                  View Applications
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Profile */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Profile</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Update your info, skills, LinkedIn, and GitHub.
                </Typography>
                <Button component={RouterLink} to="/student/profile" variant="outlined" fullWidth>
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Messages */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Messages</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Chat with recruiters and see unread messages.
                </Typography>
                <Button component={RouterLink} to="/student/messages" variant="outlined" fullWidth>
                  Open Messages
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Interviews */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Interviews</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Review upcoming and past interviews.
                </Typography>
                <Button component={RouterLink} to="/student/interviews" variant="outlined" fullWidth>
                  View Interviews
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StudentPage;
