import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Analytics as AnalyticsIcon,
  Facebook as FacebookIcon,
  Google as GoogleIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

// Interfaces
interface Pixel {
  _id: string;
  name: string;
  description: string;
  type: string;
  pixelId: string;
  status: string;
  events: Array<{
    name: string;
    description: string;
    isActive: boolean;
    customParameters: Array<{ key: string; value: string }>;
  }>;
  trackingEvents: {
    pageView: boolean;
    registration: boolean;
    testStart: boolean;
    testCompletion: boolean;
    subscription: boolean;
    purchase: boolean;
  };
  conversionValue: {
    registration: number;
    testCompletion: number;
    subscription: number;
    purchase: number;
  };
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PixelStats {
  totalPixels: number;
  activePixels: number;
  testingPixels: number;
  inactivePixels: number;
  pixelTypes: Array<{ _id: string; count: number }>;
}

const Pixels: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [stats, setStats] = useState<PixelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
  const [viewingPixel, setViewingPixel] = useState<Pixel | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    pixelId: '',
    status: 'draft',
    trackingEvents: {
      pageView: false,
      registration: false,
      testStart: false,
      testCompletion: false,
      subscription: false,
      purchase: false
    },
    conversionValue: {
      registration: 0,
      testCompletion: 0,
      subscription: 0,
      purchase: 0
    },
    isActive: false
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchPixels();
    fetchStats();
  }, [filters]);

  const fetchPixels = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/pixels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPixels(data.pixels || data);
      } else {
        throw new Error('Failed to fetch pixels');
      }
    } catch (error) {
      console.error('Error fetching pixels:', error);
      setError('Pixel verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pixels/stats/overview`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Stats yüklenirken hata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingPixel 
        ? `http://localhost:5000/api/pixels/${editingPixel._id}`
        : 'http://localhost:5000/api/pixels';
      
      const method = editingPixel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: editingPixel ? 'Pixel güncellendi' : 'Pixel oluşturuldu', 
          severity: 'success' 
        });
        setDialogOpen(false);
        resetForm();
        fetchPixels();
        fetchStats();
      } else {
        throw new Error('Failed to save pixel');
      }
    } catch (error) {
      console.error('Error saving pixel:', error);
      setError('Pixel kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu pixel\'i silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pixels/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: 'Pixel silindi',
            severity: 'success'
          });
          fetchPixels();
        } else {
          setError('Pixel silinirken hata oluştu');
        }
      } catch (error) {
        setError('Pixel silinirken hata oluştu');
      }
    }
  };

  const handleEdit = (pixel: Pixel) => {
    setEditingPixel(pixel);
    setFormData({
      name: pixel.name,
      description: pixel.description,
      type: pixel.type,
      pixelId: pixel.pixelId,
      status: pixel.status,
      trackingEvents: pixel.trackingEvents,
      conversionValue: pixel.conversionValue,
      isActive: pixel.isActive
    });
    setDialogOpen(true);
  };

  const handleView = async (pixel: Pixel) => {
    setViewingPixel(pixel);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      pixelId: '',
      status: 'draft',
      trackingEvents: {
        pageView: false,
        registration: false,
        testStart: false,
        testCompletion: false,
        subscription: false,
        purchase: false
      },
      conversionValue: {
        registration: 0,
        testCompletion: 0,
        subscription: 0,
        purchase: 0
      },
      isActive: false
    });
    setEditingPixel(null);
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbar({
      open: true,
      message: 'Kod kopyalandı',
      severity: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'testing': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'facebook': return <FacebookIcon />;
      case 'google': return <GoogleIcon />;
      case 'twitter': return <TwitterIcon />;
      case 'linkedin': return <LinkedInIcon />;
      default: return <AnalyticsIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'facebook': return '#1877f2';
      case 'google': return '#ea4335';
      case 'twitter': return '#1da1f2';
      case 'linkedin': return '#0077b5';
      case 'tiktok': return '#000000';
      default: return '#666666';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pixel/CPA Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Yeni Pixel Ekle
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Toplam Pixel
                </Typography>
                <Typography variant="h4">
                  {stats.totalPixels}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Aktif Pixel
                </Typography>
                <Typography variant="h4" color="primary">
                  {stats.activePixels}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Test Modunda
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.testingPixels}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pasif Pixel
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.inactivePixels}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
            <TextField
              fullWidth
              label="Ara"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Pixel adı, açıklama veya ID..."
            />
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                label="Durum"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="testing">Test</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <FormControl fullWidth>
              <InputLabel>Tip</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                label="Tip"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="twitter">Twitter</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
                <MenuItem value="custom">Özel</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <FormControl fullWidth>
              <InputLabel>Sıralama</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                label="Sıralama"
              >
                <MenuItem value="createdAt">Oluşturma Tarihi</MenuItem>
                <MenuItem value="name">Ad</MenuItem>
                <MenuItem value="type">Tip</MenuItem>
                <MenuItem value="status">Durum</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <FormControl fullWidth>
              <InputLabel>Sıra</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                label="Sıra"
              >
                <MenuItem value="desc">Azalan</MenuItem>
                <MenuItem value="asc">Artan</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Pixels Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pixel</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Pixel ID</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Takip Edilen Olaylar</TableCell>
              <TableCell>Oluşturan</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pixels.map((pixel) => (
              <TableRow key={pixel._id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {pixel.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {pixel.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getTypeIcon(pixel.type)}
                    label={pixel.type.toUpperCase()}
                    sx={{ 
                      backgroundColor: getTypeColor(pixel.type),
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {pixel.pixelId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={pixel.status === 'active' ? 'Aktif' : pixel.status === 'testing' ? 'Test' : 'Pasif'}
                    color={getStatusColor(pixel.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    {Object.entries(pixel.trackingEvents)
                      .filter(([_, isActive]) => isActive)
                      .map(([event, _]) => (
                        <Chip
                          key={event}
                          label={event}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {pixel.createdBy.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {pixel.createdBy.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(pixel.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Görüntüle">
                      <IconButton size="small" onClick={() => handleView(pixel)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => handleEdit(pixel)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton size="small" onClick={() => handleDelete(pixel._id)}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPixel ? 'Pixel Düzenle' : 'Yeni Pixel Ekle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Pixel Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tip</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Tip"
                    required
                  >
                    <MenuItem value="facebook">Facebook</MenuItem>
                    <MenuItem value="google">Google</MenuItem>
                    <MenuItem value="tiktok">TikTok</MenuItem>
                    <MenuItem value="twitter">Twitter</MenuItem>
                    <MenuItem value="linkedin">LinkedIn</MenuItem>
                    <MenuItem value="custom">Özel</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Pixel ID"
                  value={formData.pixelId}
                  onChange={(e) => setFormData({ ...formData, pixelId: e.target.value })}
                  required
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Durum"
                  >
                    <MenuItem value="draft">Taslak</MenuItem>
                    <MenuItem value="testing">Test</MenuItem>
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="inactive">Pasif</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Takip Edilen Olaylar
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(formData.trackingEvents).map(([event, isActive]) => (
                <FormControlLabel
                  key={event}
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setFormData({
                        ...formData,
                        trackingEvents: {
                          ...formData.trackingEvents,
                          [event]: e.target.checked
                        }
                      })}
                    />
                  }
                  label={event}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Dönüşüm Değerleri
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(formData.conversionValue).map(([event, value]) => (
                <Box key={event} sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                  <TextField
                    fullWidth
                    label={event}
                    type="number"
                    value={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      conversionValue: {
                        ...formData.conversionValue,
                        [event]: Number(e.target.value)
                      }
                    })}
                    margin="normal"
                  />
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Aktif"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="contained">
              {editingPixel ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingPixel} onClose={() => setViewingPixel(null)} maxWidth="md" fullWidth>
        {viewingPixel && (
          <>
            <DialogTitle>
              Pixel Detayları
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {viewingPixel.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {viewingPixel.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tip
                  </Typography>
                  <Chip
                    icon={getTypeIcon(viewingPixel.type)}
                    label={viewingPixel.type.toUpperCase()}
                    sx={{ 
                      backgroundColor: getTypeColor(viewingPixel.type),
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Durum
                  </Typography>
                  <Chip
                    label={viewingPixel.status === 'active' ? 'Aktif' : viewingPixel.status === 'testing' ? 'Test' : 'Pasif'}
                    color={getStatusColor(viewingPixel.status) as any}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Pixel ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {viewingPixel.pixelId}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Takip Edilen Olaylar
              </Typography>
              <Box sx={{ mb: 3 }}>
                {Object.entries(viewingPixel.trackingEvents)
                  .filter(([_, isActive]) => isActive)
                  .map(([event, _]) => (
                    <Chip
                      key={event}
                      label={event}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Dönüşüm Değerleri
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {Object.entries(viewingPixel.conversionValue).map(([event, value]) => (
                  <Box key={event} sx={{ flex: '1 1 150px' }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {event}
                    </Typography>
                    <Typography variant="h6">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Takip Kodu
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                      {`<script>/* Pixel tracking code for ${viewingPixel.name} */</script>`}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => copyTrackingCode(`<script>/* Pixel tracking code for ${viewingPixel.name} */</script>`)}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewingPixel(null)}>
                Kapat
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pixels; 