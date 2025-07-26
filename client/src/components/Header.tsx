import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Work,
  Assignment,
  Description,
  Assessment,
  ExitToApp,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { label: 'Jobs', path: '/jobs', icon: <Work /> },
    { label: 'Results', path: '/results', icon: <Assignment /> },
    { label: 'Admit Cards', path: '/admit-cards', icon: <Description /> },
  ];

  return (
    <>
      <AppBar position="sticky" color="primary">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMobileMenu}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo/Title */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ 
                mr: 2, 
                cursor: 'pointer',
                flexGrow: isMobile ? 1 : 0
              }}
              onClick={() => navigate('/')}
            >
              Sarkari Result
            </Typography>

            {/* Desktop menu */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{ mx: 1 }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* User menu */}
            {user ? (
              <Box sx={{ ml: 2 }}>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                    Profile
                  </MenuItem>
                  {user.role === 'admin' && (
                    <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ ml: 2 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.path}
                onClick={() => { navigate(item.path); toggleMobileMenu(); }}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {user ? (
              <>
                <ListItem onClick={() => { navigate('/profile'); toggleMobileMenu(); }} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                {user.role === 'admin' && (
                  <ListItem onClick={() => { navigate('/admin'); toggleMobileMenu(); }} sx={{ cursor: 'pointer' }}>
                    <ListItemIcon><Assessment /></ListItemIcon>
                    <ListItemText primary="Admin Dashboard" />
                  </ListItem>
                )}
                <ListItem onClick={() => { handleLogout(); toggleMobileMenu(); }} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon><ExitToApp /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem onClick={() => { navigate('/login'); toggleMobileMenu(); }} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem onClick={() => { navigate('/register'); toggleMobileMenu(); }} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
