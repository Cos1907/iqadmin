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
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface Feature {
  title: string;
  description: string;
  included: boolean;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  durationType: string;
  features: Feature[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  iosProductId: string;
  androidProductId: string;
  minScore: number;
  maxScore: number;
  color: string;
  icon: string;
  totalPurchases: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<SubscriptionPlan | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState(0);

  // Filtered plans based on search and filters
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterActive === 'all' || 
                         (filterActive === 'active' && plan.isActive) ||
                         (filterActive === 'inactive' && !plan.isActive);
    return matchesSearch && matchesStatus;
  });

  console.log('All plans:', plans);
  console.log('Filtered plans:', filteredPlans);
  console.log('Search term:', searchTerm);
  console.log('Filter active:', filterActive);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'TRY',
    duration: 1,
    durationType: 'months',
    features: [] as Feature[],
    isActive: true,
    isPopular: false,
    sortOrder: 0,
    iosProductId: '',
    androidProductId: '',
    minScore: 0,
    maxScore: 200,
    color: '#1976d2',
    icon: 'star'
  });

  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    included: true
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Fetching plans with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`/api/subscription-plans?search=${searchTerm}&isActive=${filterActive}&sortBy=createdAt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Plans data:', data);
      console.log('Plans data type:', typeof data);
      console.log('Plans data keys:', Object.keys(data));
      console.log('Plans array:', data.plans);
      console.log('Plans array type:', typeof data.plans);
      console.log('Plans count:', data.plans ? data.plans.length : 0);
      console.log('Is plans array?', Array.isArray(data.plans));
      setPlans(data.plans || []);
      console.log('State plans after set:', data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      setError(`Abonelik planları yüklenirken hata oluştu: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/subscription-plans/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchStats();
  }, [searchTerm, filterActive]);

  const handleCreatePlan = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/subscription-plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Plan oluşturulamadı');
      }

      await response.json();
      setDialogOpen(false);
      resetForm();
      fetchPlans();
      fetchStats();
    } catch (error) {
      console.error('Error creating plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Plan oluşturulurken hata oluştu';
      setError(errorMessage);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/subscription-plans/${editingPlan._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Plan güncellenemedi');
      }

      await response.json();
      setDialogOpen(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
      fetchStats();
    } catch (error) {
      console.error('Error updating plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Plan güncellenirken hata oluştu';
      setError(errorMessage);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Bu abonelik planını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/subscription-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Plan silinemedi');
      }

      fetchPlans();
      fetchStats();
    } catch (error) {
      console.error('Error deleting plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Plan silinirken hata oluştu';
      setError(errorMessage);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setViewingPlan(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setViewingPlan(null);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      durationType: plan.durationType,
      features: [...plan.features],
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder,
      iosProductId: plan.iosProductId,
      androidProductId: plan.androidProductId,
      minScore: plan.minScore,
      maxScore: plan.maxScore,
      color: plan.color,
      icon: plan.icon
    });
    setDialogOpen(true);
  };

  const openViewDialog = (plan: SubscriptionPlan) => {
    setViewingPlan(plan);
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'TRY',
      duration: 1,
      durationType: 'months',
      features: [],
      isActive: true,
      isPopular: false,
      sortOrder: 0,
      iosProductId: '',
      androidProductId: '',
      minScore: 0,
      maxScore: 200,
      color: '#1976d2',
      icon: 'star'
    });
  };

  const addFeature = () => {
    if (newFeature.title.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }));
      setNewFeature({ title: '', description: '', included: true });
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const toggleFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, included: !feature.included } : feature
      )
    }));
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Aktif' : 'Pasif';
  };

  const formatPrice = (price: number, currency: string) => {
    const symbols = { TRY: '₺', USD: '$', EUR: '€' };
    return `${symbols[currency as keyof typeof symbols]}${price}`;
  };

  const formatDuration = (duration: number, type: string) => {
    const types = { days: 'gün', weeks: 'hafta', months: 'ay', years: 'yıl' };
    return `${duration} ${types[type as keyof typeof types]}`;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Abonelik Planları
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Yeni Plan Ekle
        </Button>
      </Box>

      <Typography variant="body1" color="textSecondary">
        Test sonrasında gösterilecek premium paketlerin yönetimi. iOS ve Android uygulama içi satın alımlarla entegre çalışır.
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} mb={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.totalPlans}</Typography>
                  <Typography variant="body2" color="textSecondary">Toplam Plan</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.activePlans}</Typography>
                  <Typography variant="body2" color="textSecondary">Aktif Plan</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StarIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.popularPlans}</Typography>
                  <Typography variant="body2" color="textSecondary">Popüler Plan</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{formatPrice(stats.totalRevenue, 'TRY')}</Typography>
                  <Typography variant="body2" color="textSecondary">Toplam Gelir</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Plan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                label="Durum"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell>Fiyat</TableCell>
                    <TableCell>Süre</TableCell>
                    <TableCell>Skor Aralığı</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Satış</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: plan.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <Typography variant="h6" color="white">
                              {plan.icon}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle1">{plan.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {plan.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1">
                          {formatPrice(plan.price, plan.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(plan.duration, plan.durationType)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {plan.minScore} - {plan.maxScore}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(plan.isActive)}
                          color={getStatusColor(plan.isActive)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {plan.totalPurchases || 0} satış
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Görüntüle">
                            <IconButton
                              size="small"
                              onClick={() => openViewDialog(plan)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(plan)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeletePlan(plan._id)}
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
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Plan Detayları</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingPlan && (
            <Box>
              <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                <Tab label="Genel Bilgiler" />
                <Tab label="Özellikler" />
                <Tab label="İstatistikler" />
              </Tabs>

              {currentTab === 0 && (
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2} mt={2}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Plan Adı</Typography>
                    <Typography variant="body1">{viewingPlan.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Fiyat</Typography>
                    <Typography variant="body1">{formatPrice(viewingPlan.price, viewingPlan.currency)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Süre</Typography>
                    <Typography variant="body1">{formatDuration(viewingPlan.duration, viewingPlan.durationType)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Skor Aralığı</Typography>
                    <Typography variant="body1">{viewingPlan.minScore} - {viewingPlan.maxScore}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">iOS Ürün ID</Typography>
                    <Typography variant="body1">{viewingPlan.iosProductId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Android Ürün ID</Typography>
                    <Typography variant="body1">{viewingPlan.androidProductId}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="textSecondary">Açıklama</Typography>
                    <Typography variant="body1">{viewingPlan.description}</Typography>
                  </Box>
                </Box>
              )}

              {currentTab === 1 && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>Özellikler</Typography>
                  {viewingPlan.features.map((feature, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={1}>
                      {feature.included ? (
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body1">
                        <strong>{feature.title}:</strong> {feature.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {currentTab === 2 && (
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mt={2}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Toplam Satış</Typography>
                    <Typography variant="h6">{viewingPlan.totalPurchases}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Toplam Gelir</Typography>
                    <Typography variant="h6">{formatPrice(viewingPlan.totalRevenue, viewingPlan.currency)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Oluşturma Tarihi</Typography>
                    <Typography variant="body1">
                      {new Date(viewingPlan.createdAt).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Son Güncelleme</Typography>
                    <Typography variant="body1">
                      {new Date(viewingPlan.updatedAt).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPlan ? 'Plan Düzenle' : 'Yeni Plan Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2}>
              <Box>
                <TextField
                  fullWidth
                  label="Plan Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Fiyat"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  margin="normal"
                />
              </Box>
              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Para Birimi</InputLabel>
                  <Select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    label="Para Birimi"
                  >
                    <MenuItem value="TRY">TRY</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Süre"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  margin="normal"
                />
              </Box>
              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Süre Tipi</InputLabel>
                  <Select
                    value={formData.durationType}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    label="Süre Tipi"
                  >
                    <MenuItem value="days">Gün</MenuItem>
                    <MenuItem value="months">Ay</MenuItem>
                    <MenuItem value="years">Yıl</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Sıra"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Minimum Skor"
                  type="number"
                  value={formData.minScore}
                  onChange={(e) => setFormData({ ...formData, minScore: parseInt(e.target.value) || 0 })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Maksimum Skor"
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 0 })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="iOS Ürün ID"
                  value={formData.iosProductId}
                  onChange={(e) => setFormData({ ...formData, iosProductId: e.target.value })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Android Ürün ID"
                  value={formData.androidProductId}
                  onChange={(e) => setFormData({ ...formData, androidProductId: e.target.value })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Renk (HEX)"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="İkon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  margin="normal"
                />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Aktif"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    />
                  }
                  label="Popüler"
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Özellikler
                </Typography>
                <Box mb={2}>
                  <Box display="grid" gridTemplateColumns="1fr 2fr auto" gap={2} alignItems="center">
                    <TextField
                      fullWidth
                      label="Özellik Adı"
                      value={newFeature.title}
                      onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Açıklama"
                      value={newFeature.description}
                      onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={addFeature}
                      disabled={!newFeature.title || !newFeature.description}
                    >
                      Ekle
                    </Button>
                  </Box>
                </Box>
                {formData.features.map((feature, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={feature.included}
                          onChange={() => toggleFeature(index)}
                        />
                      }
                      label=""
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      <strong>{feature.title}:</strong> {feature.description}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeFeature(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button
            onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
            variant="contained"
            disabled={!formData.name || !formData.price}
          >
            {editingPlan ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default SubscriptionPlans; 