import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { logout as authLogout, decodeToken, getUserRole } from '../utils/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(() => {
    // Initialize user state immediately with current user data
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userdata = decodeToken(token);
      return userdata?.name ?? null;
    }
    return null;
  });

  const getCurrentUser = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userdata = decodeToken(token);
      const username: string = userdata?.name ?? '';
      return username; 
    }
    return null;
  };

  const handleLogout = () => {
    authLogout();
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  return {
    handleLogout,
    getCurrentUser,
    getUserRole,
    user
  };
};
