import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Quiz as QuizIcon,
  People as PeopleIcon,
  CardMembership as SubscriptionIcon,
  Star as SubscriptionPlansIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Article as BlogIcon,
  Payment as PlansIcon,
  Pages as PagesIcon,
  Campaign as CampaignIcon,
  Code as PixelsIcon,
  QuestionAnswer as QuestionIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  AccountCircle,
  Logout,
  Language,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
  { text: 'dashboard', icon: DashboardIcon, path: '/' },
  { text: 'analytics', icon: AnalyticsIcon, path: '/analytics' },
  { text: 'tests', icon: QuizIcon, path: '/tests' },
  { text: 'questions', icon: QuestionIcon, path: '/questions' },
  { text: 'categories', icon: CategoryIcon, path: '/categories' },
  { text: 'users', icon: PeopleIcon, path: '/users' },
  { text: 'subscriptions', icon: SubscriptionIcon, path: '/subscriptions' },
  { text: 'subscriptionPlans', icon: SubscriptionPlansIcon, path: '/subscription-plans' },
  { text: 'notifications', icon: NotificationsIcon, path: '/notifications' },
  { text: 'testResults', icon: AssessmentIcon, path: '/test-results' },
  { text: 'blog', icon: BlogIcon, path: '/blog' },
  { text: 'plans', icon: PlansIcon, path: '/plans' },
  { text: 'pages', icon: PagesIcon, path: '/pages' },
  { text: 'campaigns', icon: CampaignIcon, path: '/campaigns' },
  { text: 'pixels', icon: PixelsIcon, path: '/pixels' },
];

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
    handleMenuClose();
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF9900 0%, #FF6B35 100%)',
          color: 'white',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <img 
            src="/whitelogo.png" 
            alt="IQ Testim Logo" 
            style={{ 
              width: '40px', 
              height: '40px', 
              marginRight: '12px',
              borderRadius: '8px'
            }} 
          />
          <Typography variant="h6" fontWeight="bold">
            IQ Testim
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Admin Panel
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                backgroundColor: isActive ? 'rgba(255, 153, 0, 0.1)' : 'transparent',
                color: isActive ? theme.palette.primary.main : 'inherit',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: isActive ? 'rgba(255, 153, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? theme.palette.primary.main : 'inherit',
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText 
                primary={t(item.text)} 
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive ? 600 : 400,
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #FF9900 0%, #FF6B35 100%)',
        }}
      >
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
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            IQ Testim Admin - {t(menuItems.find(item => item.path === location.pathname)?.text || 'dashboard')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={handleLanguageChange}
              sx={{ mr: 1 }}
            >
              <Language />
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.name || 'Admin'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              {t('logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 