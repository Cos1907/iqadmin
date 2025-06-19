import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
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
  Rating,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import { API_ENDPOINTS, IMAGE_BASE_URL } from '../config/api';

interface Test {
  _id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  questions: any[];
  image?: string;
  isActive: boolean;
  isNew: boolean;
  participants: number;
  rating: number;
  ratingCount: number;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

const Tests: React.FC = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Aktif, 1: Pasif
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    timeLimit: 20,
    questions: [] as string[],
    image: '',
  });

  useEffect(() => {
    fetchTests();
    fetchAvailableQuestions();
    fetchCategories();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(API_ENDPOINTS.TESTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError('Testler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(API_ENDPOINTS.QUESTIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_ENDPOINTS.CATEGORIES}?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoryNames = response.data.categories.map((cat: any) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleToggleTestStatus = async (testId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_ENDPOINTS.TESTS}/${testId}`,
        { isActive: !isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Başarı mesajı göster
      const action = isActive ? 'durduruldu' : 'başlatıldı';
      setSnackbar({
        open: true,
        message: `Test başarıyla ${action}`,
        severity: 'success'
      });
      
      // Testleri yenile
      await fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
      setSnackbar({
        open: true,
        message: 'Test durumu güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Bu testi silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_ENDPOINTS.TESTS}/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
        setError('Test silinirken hata oluştu');
      }
    }
  };

  const handleCreateTest = async () => {
    try {
      // Form validasyonu
      if (!formData.title.trim()) {
        setError('Test başlığı zorunludur');
        return;
      }
      if (!formData.category) {
        setError('Kategori seçimi zorunludur');
        return;
      }
      if (!formData.difficulty) {
        setError('Zorluk seviyesi zorunludur');
        return;
      }
      if (formData.questions.length === 0) {
        setError('En az bir soru seçmelisiniz');
        return;
      }

      setUploading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      
      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('timeLimit', formData.timeLimit.toString());
      formDataToSend.append('questions', JSON.stringify(formData.questions));
      
      // Resim varsa ekle
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      console.log('Sending test data:', {
        title: formData.title,
        category: formData.category,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        questionsCount: formData.questions.length,
        hasImage: !!selectedImage
      });
      
      const response = await axios.post(API_ENDPOINTS.TESTS, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('Test created successfully:', response.data);
      setEditDialogOpen(false);
      resetForm();
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.response?.data?.error) {
          setError(error.response.data.error);
        } else {
          setError('Test oluşturulurken hata oluştu');
        }
      } else {
        setError('Test oluşturulurken hata oluştu');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateTest = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('adminToken');
      
      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('timeLimit', formData.timeLimit.toString());
      formDataToSend.append('questions', JSON.stringify(formData.questions));
      
      // Yeni resim varsa ekle
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      await axios.put(
        `${API_ENDPOINTS.TESTS}/${selectedTest?._id}`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      setEditDialogOpen(false);
      resetForm();
      fetchTests();
    } catch (error) {
      console.error('Error updating test:', error);
      setError('Test güncellenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: '',
      timeLimit: 20,
      questions: [],
      image: '',
    });
    setSelectedImage(null);
  };

  const openEditDialog = (test?: Test) => {
    if (test) {
      setSelectedTest(test);
      setFormData({
        title: test.title,
        description: test.description || '',
        category: test.category,
        difficulty: test.difficulty ? test.difficulty.toLowerCase() : '',
        timeLimit: test.timeLimit,
        questions: test.questions.map((q: any) => q._id || q),
        image: test.image || '',
      });
      setSelectedImage(null);
    } else {
      setSelectedTest(null);
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const handleQuestionToggle = (questionId: string) => {
    const newQuestions = formData.questions.includes(questionId)
      ? formData.questions.filter(id => id !== questionId)
      : [...formData.questions, questionId];
    setFormData({ ...formData, questions: newQuestions });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'kolay':
        return 'success';
      case 'orta':
        return 'warning';
      case 'zor':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Aktif ve pasif testleri filtrele
  const activeTests = tests.filter(test => test.isActive);
  const inactiveTests = tests.filter(test => !test.isActive);

  // Seçili sekmeye göre testleri filtrele
  const getFilteredTests = () => {
    const testList = activeTab === 0 ? activeTests : inactiveTests;
    return testList.filter((test) => {
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredTests = getFilteredTests();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('tests.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEditDialog()}
        >
          {t('tests.addNew')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder={t('tests.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t('tests.category')}</InputLabel>
            <Select
              value={selectedCategory}
              label={t('tests.category')}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">{t('tests.allCategories')}</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Sekmeler */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab 
            label={`Aktif Testler (${activeTests.length})`} 
            sx={{ 
              color: activeTab === 0 ? 'primary.main' : 'text.secondary',
              fontWeight: activeTab === 0 ? 'bold' : 'normal'
            }}
          />
          <Tab 
            label={`Pasif Testler (${inactiveTests.length})`} 
            sx={{ 
              color: activeTab === 1 ? 'primary.main' : 'text.secondary',
              fontWeight: activeTab === 1 ? 'bold' : 'normal'
            }}
          />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {filteredTests.map((test) => (
            <Card key={test._id} sx={{ height: 'fit-content' }}>
              {test.image && (
                <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img
                    src={`${IMAGE_BASE_URL}${test.image}`}
                    alt={test.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {test.isNew && (
                    <Chip
                      label="Yeni"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    />
                  )}
                </Box>
              )}
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {test.title}
                </Typography>
                {test.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {test.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={test.category} size="small" />
                  <Chip
                    label={test.difficulty}
                    color={getDifficultyColor(test.difficulty)}
                    size="small"
                  />
                  <Chip label={`${test.timeLimit} dk`} size="small" />
                  <Chip 
                    label={test.isActive ? 'Aktif' : 'Pasif'} 
                    color={test.isActive ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={test.rating} readOnly size="small" />
                  <Typography variant="body2" color="textSecondary">
                    ({test.ratingCount})
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {test.participants} katılımcı • {formatDate(test.createdAt)}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => {
                  setSelectedTest(test);
                  setViewDialogOpen(true);
                }}>
                  <ViewIcon />
                </IconButton>
                <IconButton onClick={() => openEditDialog(test)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteTest(test._id)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleToggleTestStatus(test._id, test.isActive)}
                  color={test.isActive ? 'success' : 'default'}
                  title={test.isActive ? 'Testi Durdur' : 'Testi Başlat'}
                >
                  {test.isActive ? <StopIcon /> : <PlayIcon />}
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Test bulunamadı mesajı */}
      {!loading && filteredTests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {activeTab === 0 ? 'Aktif test bulunamadı' : 'Pasif test bulunamadı'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Arama kriterlerinizi değiştirmeyi deneyin' 
              : activeTab === 0 
                ? 'Henüz aktif test bulunmuyor' 
                : 'Henüz pasif test bulunmuyor'
            }
          </Typography>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTest ? t('tests.editTest') : t('tests.addNew')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label={t('tests.title')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            <TextField
              fullWidth
              label={t('tests.description')}
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Box>
              <Typography variant="h6" gutterBottom>
                Test Görseli
              </Typography>
              <FileUpload
                onFileSelect={(file: File | File[]) => {
                  if (Array.isArray(file)) {
                    setSelectedImage(file[0]);
                  } else {
                    setSelectedImage(file);
                  }
                }}
                onFileRemove={() => setSelectedImage(null)}
                value={selectedImage || undefined}
                label="Test Görseli Yükle"
                helperText="Test için görsel yükleyin"
                recommendedSize="400x300px"
              />
              {formData.image && !selectedImage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Mevcut Görsel:
                  </Typography>
                  <img
                    src={`${IMAGE_BASE_URL}${formData.image}`}
                    alt="Mevcut görsel"
                    style={{ maxWidth: 200, maxHeight: 150, objectFit: 'cover', borderRadius: 4 }}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>{t('tests.category')}</InputLabel>
                <Select
                  value={formData.category}
                  label={t('tests.category')}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <InputLabel>{t('tests.difficulty')}</InputLabel>
                <Select
                  value={formData.difficulty}
                  label={t('tests.difficulty')}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <MenuItem value="kolay">{t('tests.easy')}</MenuItem>
                  <MenuItem value="orta">{t('tests.medium')}</MenuItem>
                  <MenuItem value="zor">{t('tests.hard')}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="number"
                label={t('tests.timeLimit')}
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                {t('tests.selectQuestions')}
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                {availableQuestions.map((question) => (
                  <FormControlLabel
                    key={question._id}
                    control={
                      <Checkbox
                        checked={formData.questions.includes(question._id)}
                        onChange={() => handleQuestionToggle(question._id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          {question.questionText.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={question.category} size="small" />
                          <Chip
                            label={question.difficulty}
                            color={getDifficultyColor(question.difficulty)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={selectedTest ? handleUpdateTest : handleCreateTest}
            variant="contained"
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={20} /> : (selectedTest ? t('common.update') : t('common.create'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('tests.testDetails')}</DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box sx={{ mt: 2 }}>
              {selectedTest.image && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <img
                    src={`${IMAGE_BASE_URL}${selectedTest.image}`}
                    alt={selectedTest.title}
                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                  />
                </Box>
              )}
              
              <Typography variant="h5" gutterBottom>
                {selectedTest.title}
              </Typography>
              
              {selectedTest.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedTest.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Chip label={selectedTest.category} />
                <Chip
                  label={selectedTest.difficulty}
                  color={getDifficultyColor(selectedTest.difficulty)}
                />
                <Chip label={`${selectedTest.timeLimit} dakika`} />
                <Chip label={`${selectedTest.questions.length} soru`} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={selectedTest.rating} readOnly />
                <Typography variant="body2" color="textSecondary">
                  ({selectedTest.ratingCount} değerlendirme)
                </Typography>
              </Box>

              <Typography variant="body2" color="textSecondary">
                {selectedTest.participants} katılımcı • {formatDate(selectedTest.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
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

export default Tests; 