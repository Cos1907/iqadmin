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
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import FileUpload from '../components/FileUpload';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: string;
  category: string;
  image?: string;
  optionImages?: string[];
  imageDescription?: string;
  points: number;
  timeLimit: number;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedOptionImages, setSelectedOptionImages] = useState<File[]>([]);
  const [selectedOptionFiles, setSelectedOptionFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'orta',
    category: '',
    image: '',
    optionImages: ['', '', '', ''],
    imageDescription: '',
    points: 1,
    timeLimit: 60,
  });

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Sorular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/categories?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoryNames = response.data.categories.map((cat: any) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('adminToken');
      
      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('questionText', formData.questionText);
      formDataToSend.append('options', JSON.stringify(formData.options));
      formDataToSend.append('correctAnswer', formData.correctAnswer.toString());
      formDataToSend.append('explanation', formData.explanation);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('imageDescription', formData.imageDescription);
      formDataToSend.append('points', formData.points.toString());
      formDataToSend.append('timeLimit', formData.timeLimit.toString());
      
      // Ana resim varsa ekle
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await axios.post(`${API_BASE_URL}/questions`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      // Seçenek resimleri varsa yükle
      const optionFiles = selectedOptionFiles.filter(file => file !== null);
      if (optionFiles.length > 0) {
        const optionFormData = new FormData();
        optionFiles.forEach((file) => {
          if (file) {
            optionFormData.append('optionImages', file);
          }
        });
        
        await axios.post(`${API_BASE_URL}/questions/${response.data._id}/option-images`, optionFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
      }
      
      setEditDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
      setError('Soru oluşturulurken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateQuestion = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('adminToken');
      
      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('questionText', formData.questionText);
      formDataToSend.append('options', JSON.stringify(formData.options));
      formDataToSend.append('correctAnswer', formData.correctAnswer.toString());
      formDataToSend.append('explanation', formData.explanation);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('imageDescription', formData.imageDescription);
      formDataToSend.append('points', formData.points.toString());
      formDataToSend.append('timeLimit', formData.timeLimit.toString());
      
      // Yeni resim varsa ekle
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      await axios.put(
        `${API_BASE_URL}/questions/${selectedQuestion?._id}`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      // Seçenek resimleri varsa yükle
      const optionFiles = selectedOptionFiles.filter(file => file !== null);
      if (optionFiles.length > 0) {
        const optionFormData = new FormData();
        optionFiles.forEach((file) => {
          if (file) {
            optionFormData.append('optionImages', file);
          }
        });
        
        await axios.post(`${API_BASE_URL}/questions/${selectedQuestion?._id}/option-images`, optionFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
      }
      
      setEditDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      setError('Soru güncellenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_BASE_URL}/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        setError('Soru silinirken hata oluştu');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'orta',
      category: '',
      image: '',
      optionImages: ['', '', '', ''],
      imageDescription: '',
      points: 1,
      timeLimit: 60,
    });
    setSelectedImage(null);
    setSelectedOptionImages([]);
    setSelectedOptionFiles([null, null, null, null]);
  };

  const openEditDialog = (question?: Question) => {
    if (question) {
      setSelectedQuestion(question);
      setFormData({
        questionText: question.questionText,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        difficulty: question.difficulty,
        category: question.category,
        image: question.image || '',
        optionImages: question.optionImages || ['', '', '', ''],
        imageDescription: question.imageDescription || '',
        points: question.points,
        timeLimit: question.timeLimit,
      });
      setSelectedImage(null);
      setSelectedOptionImages([]);
      setSelectedOptionFiles([null, null, null, null]);
    } else {
      setSelectedQuestion(null);
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
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

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Sorular
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEditDialog()}
        >
          Yeni Soru Ekle
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
            placeholder="Soru ara..."
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
            <InputLabel>Kategori</InputLabel>
            <Select
              value={selectedCategory}
              label="Kategori"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Zorluk</InputLabel>
            <Select
              value={selectedDifficulty}
              label="Zorluk"
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="kolay">Kolay</MenuItem>
              <MenuItem value="orta">Orta</MenuItem>
              <MenuItem value="zor">Zor</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Soru</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Zorluk</TableCell>
                <TableCell>Puan</TableCell>
                <TableCell>Resim</TableCell>
                <TableCell>Oluşturulma</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question._id}>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" noWrap>
                      {question.questionText}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={question.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={question.difficulty}
                      color={getDifficultyColor(question.difficulty)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>
                    {question.image ? (
                      <img
                        src={`http://127.0.0.1:5000${question.image}`}
                        alt="Soru resmi"
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Yok
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(question.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      setSelectedQuestion(question);
                      setViewDialogOpen(true);
                    }}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => openEditDialog(question)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteQuestion(question._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Soru Metni"
                  multiline
                  rows={3}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                />
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Soru Resmi
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
                  label="Soru Resmi Yükle"
                  helperText="Soru için resim yükleyin"
                  recommendedSize="400x300px"
                />
                {formData.image && !selectedImage && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Mevcut Resim:
                    </Typography>
                    <img
                      src={`http://127.0.0.1:5000${formData.image}`}
                      alt="Mevcut resim"
                      style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Resim Açıklaması"
                  value={formData.imageDescription}
                  onChange={(e) => setFormData({ ...formData, imageDescription: e.target.value })}
                  helperText="Resim için açıklama (isteğe bağlı)"
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Seçenekler
                </Typography>
                {formData.options.map((option, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçenek {String.fromCharCode(65 + index)}
                    </Typography>
                    <TextField
                      fullWidth
                      label={`Seçenek ${String.fromCharCode(65 + index)} Metni`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Seçenek {String.fromCharCode(65 + index)} Resmi
                      </Typography>
                      <FileUpload
                        onFileSelect={(file: File | File[]) => {
                          if (Array.isArray(file)) {
                            const newOptionFiles = [...selectedOptionFiles];
                            newOptionFiles[index] = file[0];
                            setSelectedOptionFiles(newOptionFiles);
                          } else {
                            const newOptionFiles = [...selectedOptionFiles];
                            newOptionFiles[index] = file;
                            setSelectedOptionFiles(newOptionFiles);
                          }
                        }}
                        onFileRemove={() => {
                          const newOptionFiles = [...selectedOptionFiles];
                          newOptionFiles[index] = null;
                          setSelectedOptionFiles(newOptionFiles);
                        }}
                        value={selectedOptionFiles[index] || undefined}
                        label={`Seçenek ${String.fromCharCode(65 + index)} Resmi`}
                        helperText={`Seçenek ${String.fromCharCode(65 + index)} için resim yükleyin`}
                        recommendedSize="200x200px"
                      />
                      {formData.optionImages[index] && !selectedOptionFiles[index] && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Mevcut Resim:
                          </Typography>
                          <img
                            src={`http://127.0.0.1:5000${formData.optionImages[index]}`}
                            alt={`Seçenek ${String.fromCharCode(65 + index)} resmi`}
                            style={{ maxWidth: 150, maxHeight: 150, objectFit: 'cover', borderRadius: 4 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Seçenek Resimleri (Toplu Yükleme)
                </Typography>
                <FileUpload
                  onFileSelect={(files: File | File[]) => {
                    if (Array.isArray(files)) {
                      setSelectedOptionImages(files);
                    } else {
                      setSelectedOptionImages([files]);
                    }
                  }}
                  onFileRemove={() => setSelectedOptionImages([])}
                  value={selectedOptionImages.length > 0 ? selectedOptionImages : undefined}
                  multiple={true}
                  label="Seçenek Resimleri Yükle"
                  helperText="Seçenekler için resimler yükleyin (isteğe bağlı)"
                  recommendedSize="200x200px"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Doğru Cevap</InputLabel>
                    <Select
                      value={formData.correctAnswer}
                      label="Doğru Cevap"
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    >
                      {formData.options.map((_, index) => (
                        <MenuItem key={index} value={index}>
                          {String.fromCharCode(65 + index)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Zorluk</InputLabel>
                    <Select
                      value={formData.difficulty}
                      label="Zorluk"
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <MenuItem value="kolay">Kolay</MenuItem>
                      <MenuItem value="orta">Orta</MenuItem>
                      <MenuItem value="zor">Zor</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      value={formData.category}
                      label="Kategori"
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Puan"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  />
                </Box>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  helperText="Cevap açıklaması (isteğe bağlı)"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button
            onClick={selectedQuestion ? handleUpdateQuestion : handleCreateQuestion}
            variant="contained"
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={20} /> : (selectedQuestion ? 'Güncelle' : 'Oluştur')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Soru Detayları</DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Soru:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedQuestion.questionText}
              </Typography>

              {selectedQuestion.image && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Resim:
                  </Typography>
                  <img
                    src={`http://127.0.0.1:5000${selectedQuestion.image}`}
                    alt="Soru resmi"
                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                  />
                </Box>
              )}

              <Typography variant="h6" gutterBottom>
                Seçenekler:
              </Typography>
              {selectedQuestion.options.map((option, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                    {index === selectedQuestion.correctAnswer && (
                      <Chip label="Doğru" color="success" size="small" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                  {selectedQuestion.optionImages && selectedQuestion.optionImages[index] && (
                    <img
                      src={`http://127.0.0.1:5000${selectedQuestion.optionImages[index]}`}
                      alt={`Seçenek ${String.fromCharCode(65 + index)} resmi`}
                      style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8, borderRadius: 4 }}
                    />
                  )}
                </Box>
              ))}

              {selectedQuestion.explanation && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Açıklama:
                  </Typography>
                  <Typography variant="body1">
                    {selectedQuestion.explanation}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="textSecondary">
                    Kategori: <Chip label={selectedQuestion.category} size="small" />
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="textSecondary">
                    Zorluk: <Chip label={selectedQuestion.difficulty} color={getDifficultyColor(selectedQuestion.difficulty)} size="small" />
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="textSecondary">
                    Puan: {selectedQuestion.points}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="textSecondary">
                    Süre: {selectedQuestion.timeLimit} saniye
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Questions; 