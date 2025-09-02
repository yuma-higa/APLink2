import React from 'react';
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/auth";
import { useNavigate } from 'react-router-dom';
import theme from '../styles/theme';

interface HeaderProps {
  userName?: string;
  userRole?: UserRole;
}

const drawerWidth = 240;
const navItems = ['Home', 'Profile', 'Contact', 'logout'];

const Header: React.FC<HeaderProps> = ({ userName: propUserName, userRole: propUserRole }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { handleLogout, user, getUserRole } = useAuth();
  
  const userRole = propUserRole || getUserRole() || 'STUDENT';
  const userName = propUserName || user || 'guest';



  const handleNavigation = (item: string) => {
    switch(item) {
      case "logout":
        handleLogout();
        break;
      case "Profile":
        if (userRole === 'COMPANY') {
          navigate('/company/profile');
        } else {
          navigate('/student/profile'); // 将来的に学生プロフィールページを作る場合
        }
        break;
      default:
        break;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState: boolean) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {userRole==='STUDENT'?'STUDENT':'COMPANY'}
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => handleNavigation(item)}>
              <ListItemText 
                primary={item} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: 'primary.main' 
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Box sx={{display:{xs:'none',sm:'flex'},flexDirection:'row',alignItems:'center'}}>
              <Box sx={{fontWeight: 'bold',mr:1}}>
                APLink 
              </Box>
              for
              <Box component="span" sx={{m:1,color: userRole === 'STUDENT' ? theme.palette.text.secondary : theme.palette.text.secondary }}>
                {userRole === 'STUDENT' ? 'STUDENT' : 'COMPANY'}
              </Box> 
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              APLink 
              <Box component="span" sx={{m:1,color: 'primary.main' }}>
                {userRole === 'STUDENT' ? 'STUDENT' : 'COMPANY'}
              </Box>
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            welcome、{userName}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }} onClick={() => handleNavigation(item)}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
