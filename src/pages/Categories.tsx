import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleIcon,
} from '@mui/icons-material';
import axios, { AxiosError } from 'axios';

interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#FF9900',
    icon: '',
    isActive: true,
    sortOrder: 0,
  });

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/categories`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Kategori oluşturulurken hata oluştu');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_BASE_URL}/categories/${selectedCategory?._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Kategori güncellenirken hata oluştu');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        const axiosError = error as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || 'Kategori silinirken hata oluştu');
      }
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_BASE_URL}/categories/${categoryId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      setError('Kategori durumu güncellenirken hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#FF9900',
      icon: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const openEditDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      });
    } else {
      setSelectedCategory(null);
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const colorOptions = [
    '#FF9900', '#FF6B35', '#4CAF50', '#2196F3', '#9C27B0', 
    '#F44336', '#FF9800', '#795548', '#607D8B', '#E91E63'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Kategori Yönetimi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openEditDialog()}
          >
            Yeni Kategori
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kategori</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Renk</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Sıra</TableCell>
                <TableCell>Oluşturulma</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          mr: 2,
                        }}
                      />
                      <Typography variant="body1" fontWeight="bold">
                        {category.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '4px',
                        backgroundColor: category.color,
                        border: '1px solid #ddd',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.isActive ? 'Aktif' : 'Pasif'}
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>{formatDate(category.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCategory(category);
                        setViewDialogOpen(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(category._id)}
                    >
                      <ToggleIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Category Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kategori Detayları</DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: selectedCategory.color,
                    mr: 2,
                  }}
                />
                <Typography variant="h6" fontWeight="bold">
                  {selectedCategory.name}
                </Typography>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                <strong>Açıklama:</strong> {selectedCategory.description || 'Açıklama yok'}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Renk:</strong> {selectedCategory.color}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Durum:</strong> {selectedCategory.isActive ? 'Aktif' : 'Pasif'}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Sıra:</strong> {selectedCategory.sortOrder}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Oluşturulma:</strong> {formatDate(selectedCategory.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Kategori Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" gutterBottom>
              Renk Seçimi:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                    cursor: 'pointer',
                    '&:hover': {
                      border: '2px solid #666',
                    },
                  }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                label="İkon (opsiyonel)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="emoji veya icon adı"
              />
              <TextField
                type="number"
                label="Sıra"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                sx={{ minWidth: 100 }}
              />
            </Box>

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
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={selectedCategory ? handleUpdateCategory : handleCreateCategory}
          >
            {selectedCategory ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 