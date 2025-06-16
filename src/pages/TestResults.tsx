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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface TestResult {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  test: {
    _id: string;
    title: string;
    category: string;
  };
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  timeSpent: number;
  timeLimit: number;
  categoryPerformance: Array<{
    category: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
  }>;
  difficultyPerformance: Array<{
    difficulty: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
  }>;
  percentile: number;
  rank: number;
  totalParticipants: number;
  certificate: {
    issued: boolean;
    certificateId: string;
    issuedAt: string;
  };
  feedback: {
    rating: number;
    comment: string;
  };
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

interface TestResultStats {
  totalResults: number;
  completedResults: number;
  avgScore: number;
  scoreDistribution: Array<{
    _id: string;
    count: number;
  }>;
  topPerformers: TestResult[];
  recentActivity: TestResult[];
  categoryPerformance: Array<{
    _id: string;
    avgPercentage: number;
    totalQuestions: number;
    correctAnswers: number;
  }>;
}

const TestResults: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<TestResultStats | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Filters
  const [filters, setFilters] = useState({
    testId: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchResults();
    fetchStats();
    fetchTests();
  }, [filters]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/test-results', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || data);
      } else {
        throw new Error('Failed to fetch results');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setSnackbar({ open: true, message: 'Test sonuçları yüklenirken hata oluştu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test-results/analytics/overview', {
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

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || data);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleViewDetails = async (resultId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/test-results/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSelectedResult(result);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error fetching result details:', error);
      setSnackbar({ open: true, message: 'Sonuç detayları yüklenirken hata oluştu', severity: 'error' });
    }
  };

  const handleDelete = async (resultId: string) => {
    if (!window.confirm('Bu test sonucunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/test-results/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Test sonucu silindi', severity: 'success' });
        fetchResults();
        fetchStats();
      } else {
        throw new Error('Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      setSnackbar({ open: true, message: 'Test sonucu silinirken hata oluştu', severity: 'error' });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Mükemmel';
    if (score >= 80) return 'Çok İyi';
    if (score >= 70) return 'İyi';
    if (score >= 60) return 'Orta';
    if (score >= 50) return 'Yetersiz';
    return 'Başarısız';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Test Sonuçları
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AnalyticsIcon />}
          onClick={() => window.open('/analytics', '_blank')}
        >
          Detaylı Analitik
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <Box flex="1" minWidth="200px">
            <FormControl fullWidth size="small">
              <InputLabel>Test</InputLabel>
              <Select
                value={filters.testId}
                onChange={(e) => setFilters({ ...filters, testId: e.target.value })}
                label="Test"
              >
                <MenuItem value="">Tümü</MenuItem>
                {tests.map((test) => (
                  <MenuItem key={test._id} value={test._id}>
                    {test.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex="1" minWidth="200px">
            <TextField
              label="Kullanıcı ID"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
          <Box flex="1" minWidth="150px">
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box flex="1" minWidth="150px">
            <TextField
              label="Bitiş Tarihi"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => setFilters({ testId: '', userId: '', dateFrom: '', dateTo: '' })}
              size="small"
            >
              Temizle
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      {stats && (
        <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
          <Box flex="1" minWidth="200px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AnalyticsIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalResults}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Toplam Sonuç
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1" minWidth="200px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.completedResults}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tamamlanan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1" minWidth="200px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {stats.avgScore ? stats.avgScore.toFixed(1) : '0.0'}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ortalama Puan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1" minWidth="200px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PersonIcon color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {stats.topPerformers ? stats.topPerformers.length : 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      En İyi Performans
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Test Results Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>Test</TableCell>
                <TableCell>Puan</TableCell>
                <TableCell>Doğru/Yanlış</TableCell>
                <TableCell>Süre</TableCell>
                <TableCell>Sıralama</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {result.user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {result.user.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {result.user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {result.test.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={`${result.score ? result.score.toFixed(1) : '0.0'}%`}
                        color={getScoreColor(result.score) as any}
                        size="small"
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {getScoreLabel(result.score)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {result.correctAnswers}/{result.totalQuestions}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(result.correctAnswers / result.totalQuestions) * 100}
                        sx={{ mt: 0.5, height: 4 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimerIcon fontSize="small" />
                      <Typography variant="body2">
                        {formatTime(result.timeSpent)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {result.rank}/{result.totalParticipants}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        %{result.percentile ? result.percentile.toFixed(1) : '0.0'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={result.test.category} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(result.completedAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Detayları Görüntüle">
                        <IconButton size="small" onClick={() => handleViewDetails(result._id)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(result._id)}
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

      {/* Result Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Test Sonucu Detayları
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              {/* User and Test Info */}
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <Box flex="1" minWidth="300px">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Kullanıcı Bilgileri</Typography>
                      <Typography><strong>Ad:</strong> {selectedResult.user.name}</Typography>
                      <Typography><strong>E-posta:</strong> {selectedResult.user.email}</Typography>
                      <Typography><strong>Test Tarihi:</strong> {new Date(selectedResult.completedAt).toLocaleString('tr-TR')}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Test Bilgileri</Typography>
                      <Typography><strong>Test:</strong> {selectedResult.test.title}</Typography>
                      <Typography><strong>Kategori:</strong> {selectedResult.test.category}</Typography>
                      <Typography><strong>Toplam Soru:</strong> {selectedResult.totalQuestions}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Score and Performance */}
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <Box flex="1" minWidth="300px">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Genel Performans</Typography>
                      <Typography><strong>Puan:</strong> {selectedResult.score ? selectedResult.score.toFixed(1) : '0.0'}%</Typography>
                      <Typography><strong>Doğru Cevap:</strong> {selectedResult.correctAnswers}</Typography>
                      <Typography><strong>Yanlış Cevap:</strong> {selectedResult.wrongAnswers}</Typography>
                      <Typography><strong>Cevaplanmamış:</strong> {selectedResult.unansweredQuestions}</Typography>
                      <Typography><strong>Geçen Süre:</strong> {formatTime(selectedResult.timeSpent)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Sıralama</Typography>
                      <Typography><strong>Sıra:</strong> {selectedResult.rank}</Typography>
                      <Typography><strong>Yüzdelik:</strong> {selectedResult.percentile ? selectedResult.percentile.toFixed(1) : '0.0'}%</Typography>
                      <Typography><strong>Toplam Katılımcı:</strong> {selectedResult.totalParticipants}</Typography>
                      <Typography><strong>Performans:</strong> {getScoreLabel(selectedResult.score)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Category Performance */}
              {selectedResult.categoryPerformance.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Kategori Performansı</Typography>
                    {selectedResult.categoryPerformance.map((cat, index) => (
                      <Box key={index} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{cat.category}</Typography>
                          <Typography variant="body2">
                            {cat.correctAnswers}/{cat.totalQuestions} ({cat.percentage ? cat.percentage.toFixed(1) : '0.0'}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={cat.percentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Difficulty Performance */}
              {selectedResult.difficultyPerformance.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Zorluk Seviyesi Performansı</Typography>
                    {selectedResult.difficultyPerformance.map((diff, index) => (
                      <Box key={index} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {diff.difficulty}
                          </Typography>
                          <Typography variant="body2">
                            {diff.correctAnswers}/{diff.totalQuestions} ({diff.percentage ? diff.percentage.toFixed(1) : '0.0'}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={diff.percentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Time and Feedback */}
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Box flex="1" minWidth="300px">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Zaman Bilgileri</Typography>
                      <Typography><strong>Başlangıç:</strong> {new Date(selectedResult.startedAt).toLocaleString('tr-TR')}</Typography>
                      <Typography><strong>Bitiş:</strong> {new Date(selectedResult.completedAt).toLocaleString('tr-TR')}</Typography>
                      <Typography><strong>Geçen Süre:</strong> {formatTime(selectedResult.timeSpent)}</Typography>
                      <Typography><strong>Zaman Limiti:</strong> {formatTime(selectedResult.timeLimit)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box flex="1" minWidth="300px">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Geri Bildirim</Typography>
                      {selectedResult.feedback?.rating ? (
                        <>
                          <Typography><strong>Değerlendirme:</strong> {selectedResult.feedback.rating}/5</Typography>
                          {selectedResult.feedback.comment && (
                            <Typography><strong>Yorum:</strong> {selectedResult.feedback.comment}</Typography>
                          )}
                        </>
                      ) : (
                        <Typography color="textSecondary">Geri bildirim yok</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Kapat</Button>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestResults; 