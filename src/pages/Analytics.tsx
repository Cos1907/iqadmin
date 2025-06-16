import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Publish as PublishIcon
} from '@mui/icons-material';

// Interfaces
interface AdminActivity {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  adminName: string;
  adminEmail: string;
  action: string;
  module: string;
  description: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'error' | 'warning';
  affectedRecords: number;
  createdAt: string;
}

interface AnalyticsData {
  totalActivities: number;
  activitiesByAction: Array<{ _id: string; count: number }>;
  activitiesByModule: Array<{ _id: string; count: number }>;
  activitiesByAdmin: Array<{ _id: string; count: number; adminName: string }>;
  activitiesByStatus: Array<{ _id: string; count: number }>;
  recentActivities: AdminActivity[];
  dailyActivity: Array<{ _id: { year: number; month: number; day: number }; count: number }>;
}

interface DashboardStats {
  todayActivities: number;
  yesterdayActivities: number;
  thisWeekActivities: number;
  thisMonthActivities: number;
  todayModuleStats: Array<{ _id: string; count: number }>;
  recentActivities: AdminActivity[];
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: 'all',
    module: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchAnalyticsData();
  }, [filters]);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await fetch('/api/admin-activities/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      console.log('Dashboard stats response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats data:', data);
        setDashboardStats(data);
      } else {
        const errorText = await response.text();
        console.error('Dashboard stats error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`/api/admin-activities/analytics/overview?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      console.log('Analytics data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data:', data);
        setAnalyticsData(data);
      } else {
        const errorText = await response.text();
        console.error('Analytics data error:', errorText);
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Analitik veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LoginIcon />;
      case 'logout': return <LogoutIcon />;
      case 'create': return <AddIcon />;
      case 'update': return <EditIcon />;
      case 'delete': return <DeleteIcon />;
      case 'publish': return <PublishIcon />;
      case 'unpublish': return <ViewIcon />;
      case 'feature': return <StarIcon />;
      case 'unfeature': return <StarIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'success';
      case 'logout': return 'info';
      case 'create': return 'primary';
      case 'update': return 'warning';
      case 'delete': return 'error';
      case 'publish': return 'success';
      case 'unpublish': return 'warning';
      case 'feature': return 'secondary';
      case 'unfeature': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'dashboard': return 'primary';
      case 'users': return 'secondary';
      case 'tests': return 'success';
      case 'questions': return 'warning';
      case 'categories': return 'info';
      case 'subscriptions': return 'error';
      case 'blog': return 'default';
      case 'pages': return 'primary';
      case 'campaigns': return 'secondary';
      case 'pixels': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dakika önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const handleRefresh = () => {
    fetchDashboardStats();
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analitik ve İstatistikler
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              // Export functionality
              alert('Dışa aktarma özelliği yakında eklenecek');
            }}
          >
            Dışa Aktar
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Günlük İstatistikler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUpIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{dashboardStats.todayActivities}</Typography>
                      <Typography variant="body2" color="textSecondary">Bugünkü Aktiviteler</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{dashboardStats.yesterdayActivities}</Typography>
                      <Typography variant="body2" color="textSecondary">Dünkü Aktiviteler</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <BarChartIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{dashboardStats.thisWeekActivities}</Typography>
                      <Typography variant="body2" color="textSecondary">Bu Hafta</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <PieChartIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{dashboardStats.thisMonthActivities}</Typography>
                      <Typography variant="body2" color="textSecondary">Bu Ay</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Başlangıç Tarihi"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="Bitiş Tarihi"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Aksiyon</InputLabel>
            <Select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              label="Aksiyon"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="login">Giriş</MenuItem>
              <MenuItem value="logout">Çıkış</MenuItem>
              <MenuItem value="create">Oluştur</MenuItem>
              <MenuItem value="update">Güncelle</MenuItem>
              <MenuItem value="delete">Sil</MenuItem>
              <MenuItem value="publish">Yayınla</MenuItem>
              <MenuItem value="unpublish">Yayından Kaldır</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Modül</InputLabel>
            <Select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              label="Modül"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="dashboard">Dashboard</MenuItem>
              <MenuItem value="users">Kullanıcılar</MenuItem>
              <MenuItem value="tests">Testler</MenuItem>
              <MenuItem value="questions">Sorular</MenuItem>
              <MenuItem value="categories">Kategoriler</MenuItem>
              <MenuItem value="subscriptions">Abonelikler</MenuItem>
              <MenuItem value="blog">Blog</MenuItem>
              <MenuItem value="pages">Sayfalar</MenuItem>
              <MenuItem value="campaigns">Kampanyalar</MenuItem>
              <MenuItem value="pixels">Pixel/CPA</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Durum"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="success">Başarılı</MenuItem>
              <MenuItem value="error">Hata</MenuItem>
              <MenuItem value="warning">Uyarı</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Genel Bakış" />
          <Tab label="Aksiyon Analizi" />
          <Tab label="Modül Analizi" />
          <Tab label="Admin Analizi" />
          <Tab label="Son Aktiviteler" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && analyticsData && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 500px', minWidth: '500px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aksiyon Dağılımı
              </Typography>
              <List>
                {analyticsData.activitiesByAction.slice(0, 10).map((item) => (
                  <ListItem key={item._id}>
                    <ListItemIcon>
                      {getActionIcon(item._id)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item._id}
                      secondary={`${item.count} aktivite`}
                    />
                    <Chip
                      label={item.count}
                      color={getActionColor(item._id) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 500px', minWidth: '500px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Modül Dağılımı
              </Typography>
              <List>
                {analyticsData.activitiesByModule.slice(0, 10).map((item) => (
                  <ListItem key={item._id}>
                    <ListItemIcon>
                      <AdminIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item._id}
                      secondary={`${item.count} aktivite`}
                    />
                    <Chip
                      label={item.count}
                      color={getModuleColor(item._id) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      )}

      {activeTab === 1 && analyticsData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Aksiyon Detayları
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aksiyon</TableCell>
                  <TableCell>Sayı</TableCell>
                  <TableCell>Yüzde</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.activitiesByAction.map((item) => {
                  const percentage = ((item.count / analyticsData.totalActivities) * 100).toFixed(1);
                  return (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getActionIcon(item._id)}
                          <Typography>{item._id}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(percentage)}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 2 && analyticsData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Modül Detayları
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Modül</TableCell>
                  <TableCell>Sayı</TableCell>
                  <TableCell>Yüzde</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.activitiesByModule.map((item) => {
                  const percentage = ((item.count / analyticsData.totalActivities) * 100).toFixed(1);
                  return (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminIcon />
                          <Typography>{item._id}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(percentage)}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 3 && analyticsData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            En Aktif Adminler
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Aktivite Sayısı</TableCell>
                  <TableCell>Yüzde</TableCell>
                  <TableCell>Son Aktivite</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.activitiesByAdmin.map((item) => {
                  const percentage = ((item.count / analyticsData.totalActivities) * 100).toFixed(1);
                  return (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon />
                          <Typography>{item.adminName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <Chip
                          label="Aktif"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 4 && analyticsData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Son Aktiviteler
          </Typography>
          <List>
            {analyticsData.recentActivities.map((activity) => (
              <ListItem key={activity._id} divider>
                <ListItemIcon>
                  {getActionIcon(activity.action)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.description}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {activity.adminName} • {formatRelativeTime(activity.createdAt)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={activity.action}
                          color={getActionColor(activity.action) as any}
                          size="small"
                        />
                        <Chip
                          label={activity.module}
                          color={getModuleColor(activity.module) as any}
                          size="small"
                        />
                        <Chip
                          label={activity.status}
                          color={getStatusColor(activity.status) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default Analytics; 