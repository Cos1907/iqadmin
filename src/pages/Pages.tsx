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
  Tooltip,
  TextareaAutosize,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Article as ArticleIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

// Interfaces
interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  template: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  featuredImage: string;
  tags: string[];
  category: string;
  createdBy: {
    name: string;
    email: string;
  };
  updatedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PageStats {
  totalPages: number;
  publishedPages: number;
  featuredPages: number;
  draftPages: number;
  totalViews: number;
  pagesByCategory: Array<{ _id: string; count: number }>;
  mostViewedPages: Array<{ title: string; slug: string; viewCount: number }>;
}

const Pages: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [stats, setStats] = useState<PageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingPage, setViewingPage] = useState<Page | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    template: 'default',
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    featuredImage: '',
    tags: [] as string[],
    category: 'general'
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    isPublished: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchPages();
    fetchStats();
  }, [filters]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.search && { search: filters.search }),
        ...(filters.isPublished !== 'all' && { isPublished: filters.isPublished }),
        ...(filters.category !== 'all' && { category: filters.category })
      });

      const response = await fetch(`/api/pages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      } else {
        throw new Error('Failed to fetch pages');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setError('Sayfa verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pages/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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

  const handleSubmit = async () => {
    try {
      const url = editingPage 
        ? `/api/pages/${editingPage._id}`
        : '/api/pages';
      
      const method = editingPage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'success'
        });
        setDialogOpen(false);
        resetForm();
        fetchPages();
        fetchStats();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Sayfa kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setError('Sayfa kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/pages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: 'Sayfa silindi',
            severity: 'success'
          });
          fetchPages();
          fetchStats();
        } else {
          setError('Sayfa silinirken hata oluştu');
        }
      } catch (error) {
        setError('Sayfa silinirken hata oluştu');
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/pages/${id}/toggle-publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'success'
        });
        fetchPages();
        fetchStats();
      } else {
        setError('Sayfa durumu değiştirilirken hata oluştu');
      }
    } catch (error) {
      setError('Sayfa durumu değiştirilirken hata oluştu');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const response = await fetch(`/api/pages/${id}/toggle-featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'success'
        });
        fetchPages();
        fetchStats();
      } else {
        setError('Sayfa durumu değiştirilirken hata oluştu');
      }
    } catch (error) {
      setError('Sayfa durumu değiştirilirken hata oluştu');
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      template: page.template,
      isPublished: page.isPublished,
      isFeatured: page.isFeatured,
      sortOrder: page.sortOrder,
      featuredImage: page.featuredImage,
      tags: page.tags,
      category: page.category
    });
    setDialogOpen(true);
  };

  const handleView = (page: Page) => {
    setViewingPage(page);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      template: 'default',
      isPublished: false,
      isFeatured: false,
      sortOrder: 0,
      featuredImage: '',
      tags: [],
      category: 'general'
    });
    setEditingPage(null);
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    setSnackbar({
      open: true,
      message: 'URL kopyalandı',
      severity: 'success'
    });
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'success' : 'warning';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'default';
      case 'information': return 'primary';
      case 'legal': return 'error';
      case 'marketing': return 'secondary';
      case 'help': return 'info';
      default: return 'default';
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
        Sayfa Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Yeni Sayfa Ekle
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Toplam Sayfa
                </Typography>
                <Typography variant="h4">
                  {stats.totalPages}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Yayınlanan
                </Typography>
                <Typography variant="h4" color="primary">
                  {stats.publishedPages}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Öne Çıkan
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.featuredPages}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Toplam Görüntülenme
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.totalViews}
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
              placeholder="Sayfa başlığı, içerik veya slug..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={filters.isPublished}
                onChange={(e) => setFilters({ ...filters, isPublished: e.target.value, page: 1 })}
                label="Durum"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="true">Yayınlanan</MenuItem>
                <MenuItem value="false">Taslak</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                label="Kategori"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="general">Genel</MenuItem>
                <MenuItem value="information">Bilgi</MenuItem>
                <MenuItem value="legal">Yasal</MenuItem>
                <MenuItem value="marketing">Pazarlama</MenuItem>
                <MenuItem value="help">Yardım</MenuItem>
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
                <MenuItem value="title">Başlık</MenuItem>
                <MenuItem value="viewCount">Görüntülenme</MenuItem>
                <MenuItem value="sortOrder">Sıralama</MenuItem>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Pages Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Görüntülenme</TableCell>
                <TableCell>Oluşturulma</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {page.title}
                      </Typography>
                      {page.excerpt && (
                        <Typography variant="caption" color="text.secondary">
                          {page.excerpt.substring(0, 100)}...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {page.slug}
                      </Typography>
                      <Tooltip title="URL'yi kopyala">
                        <IconButton size="small" onClick={() => copySlug(page.slug)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={page.category} 
                      size="small" 
                      color={getCategoryColor(page.category) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={page.isPublished ? 'Yayında' : 'Taslak'} 
                        size="small" 
                        color={getStatusColor(page.isPublished) as any}
                      />
                      {page.isFeatured && (
                        <StarIcon color="warning" fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {page.viewCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(page.createdAt).toLocaleDateString('tr-TR')}
        </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Görüntüle">
                        <IconButton size="small" onClick={() => handleView(page)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleEdit(page)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={page.isPublished ? 'Taslak Yap' : 'Yayınla'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleTogglePublish(page._id)}
                        >
                          {page.isPublished ? <HideIcon /> : <ViewIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={page.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleFeatured(page._id)}
                        >
                          {page.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(page._id)}
                          color="error"
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
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingPage ? 'Sayfa Düzenle' : 'Yeni Sayfa Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: '1 1 66%' }}>
                <TextField
                  fullWidth
                  label="Başlık"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  margin="normal"
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 33%' }}>
                <TextField
                  fullWidth
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  margin="normal"
                  placeholder="otomatik-oluşturulacak"
                  helperText="Boş bırakılırsa başlıktan otomatik oluşturulur"
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Özet"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                margin="normal"
                multiline
                rows={2}
                helperText="Sayfa özeti (500 karakter)"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                İçerik
              </Typography>
              <TextareaAutosize
                minRows={8}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Sayfa içeriğini buraya yazın..."
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Kategori"
                  >
                    <MenuItem value="general">Genel</MenuItem>
                    <MenuItem value="information">Bilgi</MenuItem>
                    <MenuItem value="legal">Yasal</MenuItem>
                    <MenuItem value="marketing">Pazarlama</MenuItem>
                    <MenuItem value="help">Yardım</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 50%' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Şablon</InputLabel>
                  <Select
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    label="Şablon"
                  >
                    <MenuItem value="default">Varsayılan</MenuItem>
                    <MenuItem value="landing">Landing Page</MenuItem>
                    <MenuItem value="contact">İletişim</MenuItem>
                    <MenuItem value="about">Hakkımızda</MenuItem>
                    <MenuItem value="privacy">Gizlilik</MenuItem>
                    <MenuItem value="terms">Şartlar</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <TextField
                  fullWidth
                  label="Sıralama"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: '1 1 50%' }}>
                <TextField
                  fullWidth
                  label="Öne Çıkan Resim URL"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  margin="normal"
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Etiketler (virgülle ayırın)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                margin="normal"
                helperText="Etiketleri virgülle ayırın"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                SEO Ayarları
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Meta Başlık"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                margin="normal"
                helperText="60 karakterden az olmalı"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Meta Açıklama"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                margin="normal"
                multiline
                rows={2}
                helperText="160 karakterden az olmalı"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Meta Anahtar Kelimeler (virgülle ayırın)"
                value={formData.metaKeywords.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  metaKeywords: e.target.value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
                })}
                margin="normal"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Sayfa Ayarları
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                  }
                  label="Yayınla"
                />
              </Box>
              <Box sx={{ flex: '1 1 50%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                  }
                  label="Öne Çıkar"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPage ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={!!viewingPage} 
        onClose={() => setViewingPage(null)} 
        maxWidth="md" 
        fullWidth
      >
        {viewingPage && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ArticleIcon />
                {viewingPage.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Slug: {viewingPage.slug}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Kategori: {viewingPage.category}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Görüntülenme: {viewingPage.viewCount}
                </Typography>
              </Box>
              {viewingPage.excerpt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Özet
                  </Typography>
                  <Typography variant="body1">
                    {viewingPage.excerpt}
                  </Typography>
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  İçerik
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {viewingPage.content}
                </Typography>
              </Box>
              {viewingPage.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Etiketler
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {viewingPage.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewingPage(null)}>
                Kapat
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pages; 