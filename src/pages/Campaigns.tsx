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
  Divider,
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
  Campaign as CampaignIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: {
    amount: number;
    currency: string;
    spent: number;
  };
  targetAudience: {
    ageRange?: {
      min: number;
      max: number;
    };
    gender: string;
    interests: string[];
    location: string[];
  };
  trackingCode: string;
  conversionGoals: string;
  customGoal?: string;
  commission: number;
  commissionType: string;
  trackingMetrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  creativeAssets: {
    bannerUrl?: string;
    landingPageUrl?: string;
    description?: string;
  };
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Filtered campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.trackingCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    budget: {
      amount: 0,
      currency: 'TRY',
      spent: 0
    },
    targetAudience: {
      ageRange: { min: 18, max: 65 } as { min: number; max: number; } | undefined,
      gender: 'all',
      interests: [] as string[],
      location: [] as string[]
    },
    conversionGoals: '',
    customGoal: '',
    commission: 0,
    commissionType: 'percentage',
    creativeAssets: {
      bannerUrl: '' as string | undefined,
      landingPageUrl: '' as string | undefined,
      description: '' as string | undefined
    }
  });

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        setError('Kampanyalar getirilirken hata oluştu');
      }
    } catch (error) {
      setError('Kampanyalar getirilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/campaigns/analytics/overview', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCampaign ? `/api/campaigns/${editingCampaign._id}` : '/api/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDialogOpen(false);
        setEditingCampaign(null);
        resetForm();
        fetchCampaigns();
        fetchStats();
      } else {
        setError('Kampanya kaydedilirken hata oluştu');
      }
    } catch (error) {
      setError('Kampanya kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/campaigns/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          fetchCampaigns();
          fetchStats();
        } else {
          setError('Kampanya silinirken hata oluştu');
        }
      } catch (error) {
        setError('Kampanya silinirken hata oluştu');
      }
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate.split('T')[0],
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      budget: campaign.budget,
      targetAudience: {
        ageRange: campaign.targetAudience.ageRange || { min: 18, max: 65 },
        gender: campaign.targetAudience.gender,
        interests: campaign.targetAudience.interests || [],
        location: campaign.targetAudience.location || []
      },
      conversionGoals: campaign.conversionGoals,
      customGoal: campaign.customGoal || '',
      commission: campaign.commission,
      commissionType: campaign.commissionType,
      creativeAssets: {
        bannerUrl: campaign.creativeAssets.bannerUrl || '',
        landingPageUrl: campaign.creativeAssets.landingPageUrl || '',
        description: campaign.creativeAssets.description || ''
      }
    });
    setDialogOpen(true);
  };

  const handleView = (campaign: Campaign) => {
    setViewingCampaign(campaign);
    setViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      status: 'draft',
      startDate: '',
      endDate: '',
      budget: {
        amount: 0,
        currency: 'TRY',
        spent: 0
      },
      targetAudience: {
        ageRange: { min: 18, max: 65 } as { min: number; max: number; } | undefined,
        gender: 'all',
        interests: [] as string[],
        location: [] as string[]
      },
      conversionGoals: '',
      customGoal: '',
      commission: 0,
      commissionType: 'percentage',
      creativeAssets: {
        bannerUrl: '' as string | undefined,
        landingPageUrl: '' as string | undefined,
        description: '' as string | undefined
      }
    });
  };

  const copyTrackingCode = (trackingCode: string) => {
    navigator.clipboard.writeText(trackingCode);
    // You could add a toast notification here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'draft': return 'warning';
      case 'paused': return 'info';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'affiliate': return 'primary';
      case 'referral': return 'secondary';
      case 'promotional': return 'success';
      case 'social': return 'info';
      case 'email': return 'warning';
      case 'banner': return 'error';
      case 'popup': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Kampanya Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setEditingCampaign(null);
            setDialogOpen(true);
          }}
        >
          Yeni Kampanya
        </Button>
      </Box>

      {/* Analytics Cards */}
      {stats && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3} mb={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CampaignIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.totalCampaigns}</Typography>
                  <Typography variant="body2" color="textSecondary">Toplam Kampanya</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.activeCampaigns}</Typography>
                  <Typography variant="body2" color="textSecondary">Aktif Kampanya</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.totalBudget?.toLocaleString()} ₺</Typography>
                  <Typography variant="body2" color="textSecondary">Toplam Bütçe</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.totalConversions}</Typography>
                  <Typography variant="body2" color="textSecondary">Toplam Dönüşüm</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Kampanya ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Durum</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Durum"
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Pasif</MenuItem>
            <MenuItem value="draft">Taslak</MenuItem>
            <MenuItem value="paused">Duraklatılmış</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tip</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Tip"
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="affiliate">Affiliate</MenuItem>
            <MenuItem value="referral">Referans</MenuItem>
            <MenuItem value="promotional">Promosyon</MenuItem>
            <MenuItem value="social">Sosyal Medya</MenuItem>
            <MenuItem value="email">E-posta</MenuItem>
            <MenuItem value="banner">Banner</MenuItem>
            <MenuItem value="popup">Popup</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Campaigns Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kampanya Adı</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Takip Kodu</TableCell>
              <TableCell>Bütçe</TableCell>
              <TableCell>Gösterim</TableCell>
              <TableCell>Tıklama</TableCell>
              <TableCell>Dönüşüm</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign._id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {campaign.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {campaign.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={campaign.type}
                    color={getTypeColor(campaign.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={campaign.status}
                    color={getStatusColor(campaign.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontFamily="monospace">
                      {campaign.trackingCode}
                    </Typography>
                    <Tooltip title="Kodu Kopyala">
                      <IconButton
                        size="small"
                        onClick={() => copyTrackingCode(campaign.trackingCode)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {campaign.budget.spent.toLocaleString()} / {campaign.budget.amount.toLocaleString()} ₺
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {campaign.trackingMetrics.impressions.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {campaign.trackingMetrics.clicks.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {campaign.trackingMetrics.conversions.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Görüntüle">
                      <IconButton size="small" onClick={() => handleView(campaign)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => handleEdit(campaign)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton size="small" onClick={() => handleDelete(campaign._id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                fullWidth
                label="Kampanya Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Kampanya Tipi</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Kampanya Tipi"
                  required
                >
                  <MenuItem value="affiliate">Affiliate</MenuItem>
                  <MenuItem value="referral">Referans</MenuItem>
                  <MenuItem value="promotional">Promosyon</MenuItem>
                  <MenuItem value="social">Sosyal Medya</MenuItem>
                  <MenuItem value="email">E-posta</MenuItem>
                  <MenuItem value="banner">Banner</MenuItem>
                  <MenuItem value="popup">Popup</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Durum"
                >
                  <MenuItem value="draft">Taslak</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                  <MenuItem value="paused">Duraklatılmış</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Bütçe (₺)"
                type="number"
                value={formData.budget.amount}
                onChange={(e) => setFormData({
                  ...formData,
                  budget: { ...formData.budget, amount: Number(e.target.value) }
                })}
              />
              <FormControl fullWidth>
                <InputLabel>Dönüşüm Hedefi</InputLabel>
                <Select
                  value={formData.conversionGoals}
                  onChange={(e) => setFormData({ ...formData, conversionGoals: e.target.value })}
                  label="Dönüşüm Hedefi"
                  required
                >
                  <MenuItem value="registration">Kayıt</MenuItem>
                  <MenuItem value="test_completion">Test Tamamlama</MenuItem>
                  <MenuItem value="subscription">Abonelik</MenuItem>
                  <MenuItem value="app_download">Uygulama İndirme</MenuItem>
                  <MenuItem value="custom">Özel</MenuItem>
                </Select>
              </FormControl>
              {formData.conversionGoals === 'custom' && (
                <TextField
                  fullWidth
                  label="Özel Hedef"
                  value={formData.customGoal}
                  onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                />
              )}
              <TextField
                fullWidth
                label="Komisyon"
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
              />
              <FormControl fullWidth>
                <InputLabel>Komisyon Tipi</InputLabel>
                <Select
                  value={formData.commissionType}
                  onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                  label="Komisyon Tipi"
                >
                  <MenuItem value="percentage">Yüzde</MenuItem>
                  <MenuItem value="fixed">Sabit</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCampaign ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Kampanya Detayları</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingCampaign && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{viewingCampaign.name}</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {viewingCampaign.description}
              </Typography>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Tip</Typography>
                  <Chip label={viewingCampaign.type} color={getTypeColor(viewingCampaign.type) as any} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Durum</Typography>
                  <Chip label={viewingCampaign.status} color={getStatusColor(viewingCampaign.status) as any} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Takip Kodu</Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {viewingCampaign.trackingCode}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Dönüşüm Hedefi</Typography>
                  <Typography variant="body2">{viewingCampaign.conversionGoals}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Takip Metrikleri</Typography>
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2} mb={2}>
                <Box textAlign="center">
                  <Typography variant="h6">{viewingCampaign.trackingMetrics.impressions.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">Gösterim</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{viewingCampaign.trackingMetrics.clicks.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">Tıklama</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{viewingCampaign.trackingMetrics.conversions.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">Dönüşüm</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{viewingCampaign.trackingMetrics.revenue.toLocaleString()} ₺</Typography>
                  <Typography variant="body2" color="textSecondary">Gelir</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Campaigns; 