import React from 'react';
import { Box } from '@mui/material';
import Header from "../../layouts/Header";
import { useAuth } from '../../hooks/useAuth';

const CompanyPage: React.FC = () => {
  const { user, getUserRole } = useAuth();
  
  const userName = user || 'guest';
  const userRole = getUserRole() || 'COMPANY';



  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header userName={userName} userRole={userRole} />
    </Box>
  );
};

export default CompanyPage;
