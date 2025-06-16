import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as QuestionIcon,
  MonetizationOn as MoneyIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Create as CreateIcon,
  ViewList as ViewListIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalTests: number;
  totalSubscriptions: number;
  totalRevenue: number;
  testsSolved24h: number;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
  }>;
  recentTestResults: Array<{
    _id: string;
    userId?: { _id: string; name: string; email: string };
    testId?: { _id: string; title: string };
    user?: { _id: string; name: string; email: string };
    test?: { _id: string; title: string };
    score: number;
    completedAt: string;
  }>;
  recentSubscriptions: Array<{
    _id: string;
    userId?: { _id: string; name: string; email: string };
    user?: { _id: string; name: string; email: string };
    planId?: { _id: string; name: string; price: number };
    planDetails?: { name: string; price: number };
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Fetching dashboard data with token:', token ? 'Token exists' : 'No token');
      
      // Eğer token yoksa, önce login yapalım
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      const response = await axios.get('/api/admin/dashboard-overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Dashboard API response:', response.data);
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Eğer 401 hatası alırsak, login sayfasına yönlendir
      if (error.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      
      // Hata durumunda varsayılan değerler göster
      setStats({
        totalUsers: 0,
        totalTests: 0,
        totalSubscriptions: 0,
        totalRevenue: 0,
        testsSolved24h: 0,
        recentUsers: [],
        recentTestResults: [],
        recentSubscriptions: []
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        {t('dashboard')}
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9900 0%, #FFB84D 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.totalUsers}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{t('totalUsers') || 'Toplam Kullanıcı'}</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.totalTests}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{t('totalTests') || 'Toplam Test'}</Typography>
                </Box>
                <QuestionIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.totalSubscriptions}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{t('totalSubscriptions') || 'Toplam Üyelik'}</Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #009688 0%, #4DD0E1 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">₺{stats.totalRevenue.toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Toplam Kazanılan Tutar</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #FFB300 0%, #FFD54F 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.testsSolved24h}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Son 24 Saatte Çözülen Test</Typography>
                </Box>
                <TimerIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Hızlı İşlemler
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={() => navigate('/tests/create')}
              sx={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
                color: 'white',
                py: 1.5
              }}
            >
              Test Oluştur
            </Button>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              fullWidth
              onClick={() => navigate('/questions/create')}
              sx={{ 
                background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                color: 'white',
                py: 1.5
              }}
            >
              Soru Ekle
            </Button>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              fullWidth
              onClick={() => navigate('/subscription-plans/create')}
              sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                color: 'white',
                py: 1.5
              }}
            >
              Abonelik Oluştur
            </Button>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Button
              variant="contained"
              startIcon={<ViewListIcon />}
              fullWidth
              onClick={() => navigate('/test-results')}
              sx={{ 
                background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                color: 'white',
                py: 1.5
              }}
            >
              Test Sonuçları
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Recent Activities */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Recent Users */}
        <Box sx={{ flex: '1 1 350px', minWidth: '350px' }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Son Kayıt Olan Kullanıcılar
              </Typography>
              <PersonAddIcon color="primary" />
            </Box>
            <List>
              {(stats.recentUsers || []).map((user, index) => (
                <React.Fragment key={user._id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(user.createdAt)} • {user.role}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < (stats.recentUsers || []).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Recent Test Results */}
        <Box sx={{ flex: '1 1 350px', minWidth: '350px' }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Son Test Sonuçları
              </Typography>
              <CheckCircleIcon color="success" />
            </Box>
            <List>
              {(stats.recentTestResults || []).map((result, index) => {
                // Hem eski (userId, testId) hem yeni (user, test) desteği
                const user = (result as any).user || (result as any).userId;
                const test = (result as any).test || (result as any).testId;
                return (
                  <React.Fragment key={result._id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={test?.title || 'Test'}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {(user?.name || 'Kullanıcı')} • {result.score} puan
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(result.completedAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={`${result.score} puan`} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </ListItem>
                    {index < (stats.recentTestResults || []).length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Box>

        {/* Recent Subscriptions */}
        <Box sx={{ flex: '1 1 350px', minWidth: '350px' }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Son Abonelikler
              </Typography>
              <PaymentIcon color="warning" />
            </Box>
            <List>
              {(stats.recentSubscriptions || []).map((subscription, index) => {
                // Hem eski (planDetails, userId) hem yeni (planId, user) desteği
                const plan = (subscription as any).planId || (subscription as any).planDetails || { name: 'Plan', price: 0 };
                const user = (subscription as any).user || (subscription as any).userId;
                return (
                  <React.Fragment key={subscription._id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                          <StarIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={plan?.name || 'Plan'}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {(user?.name || 'Kullanıcı')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(subscription.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₺{(plan?.price || 0).toLocaleString()}
                        </Typography>
                        <Chip 
                          label={subscription.paymentStatus} 
                          size="small" 
                          color={subscription.paymentStatus === 'completed' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                    {index < (stats.recentSubscriptions || []).length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 