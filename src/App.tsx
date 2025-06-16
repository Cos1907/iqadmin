import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Tests from './pages/Tests';
import Questions from './pages/Questions';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Notifications from './pages/Notifications';
import TestResults from './pages/TestResults';
import Blog from './pages/Blog';
import Plans from './pages/Plans';
import Pages from './pages/Pages';
import Campaigns from './pages/Campaigns';
import Pixels from './pages/Pixels';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Turuncu tonları ile tema oluştur
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9900',
      light: '#FFB84D',
      dark: '#E68A00',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF6B35',
      light: '#FF8A65',
      dark: '#E55A2B',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Protected Route bileşeni
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Eğer hala loading durumundaysa, loading göster
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #FF9900 0%, #FF6B35 100%)'
      }}>
        <div style={{ 
          color: 'white', 
          fontSize: '18px',
          textAlign: 'center'
        }}>
          Yükleniyor...
        </div>
      </div>
    );
  }
  
  // Loading bittiyse ve authenticate değilse login'e yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="tests" element={<Tests />} />
                <Route path="tests/create" element={<Tests />} />
                <Route path="questions" element={<Questions />} />
                <Route path="questions/create" element={<Questions />} />
                <Route path="categories" element={<Categories />} />
                <Route path="users" element={<Users />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="subscription-plans" element={<SubscriptionPlans />} />
                <Route path="subscription-plans/create" element={<SubscriptionPlans />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="test-results" element={<TestResults />} />
                <Route path="blog" element={<Blog />} />
                <Route path="plans" element={<Plans />} />
                <Route path="pages" element={<Pages />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="pixels" element={<Pixels />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
