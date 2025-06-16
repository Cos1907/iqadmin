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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  age?: string;
  gender?: string;
  selectedAvatar?: string;
  createdAt: string;
  updatedAt: string;
  purchasedTests?: any[];
  results?: any[];
  subscriptions?: any[];
}

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_BASE_URL}/auth/users/${selectedUser?._id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Kullanıcı güncellenirken hata oluştu');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Kullanıcı silinirken hata oluştu');
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'super_admin':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
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
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        {t('userManagement')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Kullanıcı ara..."
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
            onClick={() => {
              setSelectedUser(null);
              setEditDialogOpen(true);
            }}
          >
            Yeni Kullanıcı
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>E-posta Doğrulandı</TableCell>
                <TableCell>Kayıt Tarihi</TableCell>
                <TableCell>Test Sayısı</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box
                        component="img"
                        src={`/avatars/${user.selectedAvatar || 'avatar1.png'}`}
                        alt="Avatar"
                        sx={{ width: 40, height: 40, borderRadius: '50%', mr: 2 }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.age} • {user.gender}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.emailVerified ? 'Evet' : 'Hayır'}
                      color={user.emailVerified ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.purchasedTests?.length || 0} test
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setViewDialogOpen(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
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

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Kullanıcı Detayları</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedUser.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>E-posta:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Rol:</strong> {selectedUser.role}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Yaş:</strong> {selectedUser.age || 'Belirtilmemiş'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Cinsiyet:</strong> {selectedUser.gender || 'Belirtilmemiş'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Avatar:</strong> {selectedUser.selectedAvatar || 'Varsayılan'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Kayıt Tarihi:</strong> {formatDate(selectedUser.createdAt)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Satın Alınan Testler:</strong> {selectedUser.purchasedTests?.length || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Test Sonuçları:</strong> {selectedUser.results?.length || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Aktif Üyelikler:</strong> {selectedUser.subscriptions?.length || 0}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Ad Soyad"
              defaultValue={selectedUser?.name || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="E-posta"
              defaultValue={selectedUser?.email || ''}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rol</InputLabel>
              <Select defaultValue={selectedUser?.role || 'user'}>
                <MenuItem value="user">Kullanıcı</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Süper Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Yaş Grubu</InputLabel>
              <Select defaultValue={selectedUser?.age || ''}>
                <MenuItem value="">Belirtilmemiş</MenuItem>
                <MenuItem value="18-24">18-24</MenuItem>
                <MenuItem value="25-34">25-34</MenuItem>
                <MenuItem value="35-44">35-44</MenuItem>
                <MenuItem value="45-54">45-54</MenuItem>
                <MenuItem value="55+">55+</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Cinsiyet</InputLabel>
              <Select defaultValue={selectedUser?.gender || ''}>
                <MenuItem value="">Belirtilmemiş</MenuItem>
                <MenuItem value="Erkek">Erkek</MenuItem>
                <MenuItem value="Kadın">Kadın</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={() => handleEditUser({})}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 