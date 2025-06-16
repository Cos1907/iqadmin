import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Subscription {
  _id: string;
  userId: string;
  user: {
    email: string;
    name: string;
  };
  plan: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
  };
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  maxTests: number;
  maxUsers?: number;
  description: string;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  monthlyRevenue: number;
  averageSubscriptionDuration: number;
  topPlans: Array<{
    planName: string;
    count: number;
  }>;
}

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'add'>('view');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state for add/edit
  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    status: 'active',
    startDate: '',
    endDate: '',
    autoRenew: true,
    paymentMethod: 'credit_card'
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend'ten gelen veriyi kontrol et
      const data = response.data;
      if (data && Array.isArray(data.subscriptions)) {
        setSubscriptions(data.subscriptions);
      } else if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        console.warn('API returned unexpected data structure:', data);
        setSubscriptions([]);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Abonelikler yüklenirken hata oluştu');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/subscriptions/plans/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/subscriptions/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
    fetchStats();
  }, []);

  const handleOpenDialog = (type: 'view' | 'edit' | 'add', subscription?: Subscription) => {
    setDialogType(type);
    if (subscription) {
      setSelectedSubscription(subscription);
      setFormData({
        userId: subscription.userId,
        planId: subscription.plan._id,
        status: subscription.status,
        startDate: subscription.startDate.split('T')[0],
        endDate: subscription.endDate.split('T')[0],
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod
      });
    } else {
      setSelectedSubscription(null);
      setFormData({
        userId: '',
        planId: '',
        status: 'active',
        startDate: '',
        endDate: '',
        autoRenew: true,
        paymentMethod: 'credit_card'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (dialogType === 'add') {
        await axios.post('/api/subscriptions', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (dialogType === 'edit' && selectedSubscription) {
        await axios.put(`/api/subscriptions/${selectedSubscription._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      handleCloseDialog();
      fetchSubscriptions();
      fetchStats();
    } catch (err: any) {
      console.error('Error saving subscription:', err);
      setError(err.response?.data?.message || 'Abonelik kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu aboneliği silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`/api/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSubscriptions();
        fetchStats();
      } catch (err: any) {
        console.error('Error deleting subscription:', err);
        setError(err.response?.data?.message || 'Abonelik silinirken hata oluştu');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'cancelled': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'expired': return 'Süresi Dolmuş';
      case 'cancelled': return 'İptal Edilmiş';
      case 'pending': return 'Beklemede';
      default: return status;
    }
  };

  const filteredSubscriptions = (subscriptions || []).filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesSearch = sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'user':
        aValue = a.user.email;
        bValue = b.user.email;
        break;
      case 'plan':
        aValue = a.plan.name;
        bValue = b.plan.name;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'startDate':
        aValue = new Date(a.startDate);
        bValue = new Date(b.startDate);
        break;
      case 'endDate':
        aValue = new Date(a.endDate);
        bValue = new Date(b.endDate);
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Abonelik Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Yeni Abonelik
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2} mb={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Abonelik
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalSubscriptions}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aktif Abonelik
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.activeSubscriptions}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aylık Gelir
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    ₺{stats.monthlyRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ortalama Süre
                  </Typography>
                  <Typography variant="h4">
                    {stats.averageSubscriptionDuration} gün
                  </Typography>
                </Box>
                <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Ara"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Durum</InputLabel>
          <Select
            value={filterStatus}
            label="Durum"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="expired">Süresi Dolmuş</MenuItem>
            <MenuItem value="cancelled">İptal Edilmiş</MenuItem>
            <MenuItem value="pending">Beklemede</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sırala</InputLabel>
          <Select
            value={sortBy}
            label="Sırala"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="createdAt">Oluşturma Tarihi</MenuItem>
            <MenuItem value="user">Kullanıcı</MenuItem>
            <MenuItem value="plan">Plan</MenuItem>
            <MenuItem value="status">Durum</MenuItem>
            <MenuItem value="startDate">Başlangıç</MenuItem>
            <MenuItem value="endDate">Bitiş</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
        >
          {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
        </Button>
      </Box>

      {/* Subscriptions Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Bitiş</TableCell>
              <TableCell>Otomatik Yenileme</TableCell>
              <TableCell>Ödeme Yöntemi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSubscriptions.map((subscription) => (
              <TableRow key={subscription._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {subscription.user.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {subscription.user.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {subscription.plan.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ₺{subscription.plan.price}/ay
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(subscription.status)}
                    color={getStatusColor(subscription.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(subscription.startDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={subscription.autoRenew ? 'Evet' : 'Hayır'}
                    color={subscription.autoRenew ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {subscription.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 
                   subscription.paymentMethod === 'bank_transfer' ? 'Banka Havalesi' :
                   subscription.paymentMethod}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Görüntüle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('view', subscription)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', subscription)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(subscription._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Yeni Abonelik Ekle' :
           dialogType === 'edit' ? 'Abonelik Düzenle' : 'Abonelik Detayları'}
        </DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mt={1}>
            {dialogType !== 'view' ? (
              <>
                <TextField
                  label="Kullanıcı ID"
                  fullWidth
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={formData.planId}
                    label="Plan"
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan._id} value={plan._id}>
                        {plan.name} - ₺{plan.price}/ay
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.status}
                    label="Durum"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="expired">Süresi Dolmuş</MenuItem>
                    <MenuItem value="cancelled">İptal Edilmiş</MenuItem>
                    <MenuItem value="pending">Beklemede</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Başlangıç Tarihi"
                  type="date"
                  fullWidth
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Bitiş Tarihi"
                  type="date"
                  fullWidth
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth>
                  <InputLabel>Ödeme Yöntemi</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Ödeme Yöntemi"
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <MenuItem value="credit_card">Kredi Kartı</MenuItem>
                    <MenuItem value="bank_transfer">Banka Havalesi</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.autoRenew}
                      onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                    />
                  }
                  label="Otomatik Yenileme"
                />
              </>
            ) : selectedSubscription ? (
              <>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Kullanıcı</Typography>
                  <Typography variant="body1">{selectedSubscription.user.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{selectedSubscription.user.email}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Plan</Typography>
                  <Typography variant="body1">{selectedSubscription.plan.name}</Typography>
                  <Typography variant="body2" color="textSecondary">₺{selectedSubscription.plan.price}/ay</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Durum</Typography>
                  <Chip
                    label={getStatusText(selectedSubscription.status)}
                    color={getStatusColor(selectedSubscription.status) as any}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Otomatik Yenileme</Typography>
                  <Chip
                    label={selectedSubscription.autoRenew ? 'Evet' : 'Hayır'}
                    color={selectedSubscription.autoRenew ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Başlangıç Tarihi</Typography>
                  <Typography variant="body1">
                    {new Date(selectedSubscription.startDate).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Bitiş Tarihi</Typography>
                  <Typography variant="body1">
                    {new Date(selectedSubscription.endDate).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Ödeme Yöntemi</Typography>
                  <Typography variant="body1">
                    {selectedSubscription.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 
                     selectedSubscription.paymentMethod === 'bank_transfer' ? 'Banka Havalesi' :
                     selectedSubscription.paymentMethod}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Oluşturma Tarihi</Typography>
                  <Typography variant="body1">
                    {new Date(selectedSubscription.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              </>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {dialogType !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogType === 'add' ? 'Ekle' : 'Güncelle'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subscriptions; 