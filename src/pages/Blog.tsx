import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tooltip,
  Input,
  CircularProgress
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
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Editor } from '@tinymce/tinymce-react';

interface BlogPost {
  _id: string;
  title: {
    tr: string;
    en: string;
  };
  content: {
    tr: string;
    en: string;
  };
  excerpt: {
    tr: string;
    en: string;
  };
  language: string;
  category: string;
  tags: string[];
  featuredImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  likes: string[];
  comments: any[];
  author: {
    name: string;
    email: string;
  };
  seoTitle?: {
    tr: string;
    en: string;
  };
  seoDescription?: {
    tr: string;
    en: string;
  };
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
}

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    isPublished: false,
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    language: 'tr'
  });

  const categories = ['Genel', 'Eğitim', 'Teknoloji', 'Sağlık', 'Spor', 'Bilim', 'Kültür'];
  const languages = [
    { value: 'tr', label: t('blog.languages.tr') },
    { value: 'en', label: t('blog.languages.en') }
  ];

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [selectedLanguage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/blog/admin/all?language=${selectedLanguage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.blogs || data);
      } else {
        throw new Error('Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setSnackbar({ open: true, message: t('blog.errorLoading'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blog/stats/overview', {
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'Dosya boyutu 5MB\'dan küçük olmalıdır', severity: 'error' });
      return;
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ open: true, message: 'Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP)', severity: 'error' });
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Uploading image...', { file: file.name, size: file.size, type: file.type });
      
      const response = await fetch('http://localhost:5000/api/blog/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success:', data);
        setFormData(prev => ({ ...prev, featuredImage: data.imageUrl }));
        setSnackbar({ open: true, message: t('blog.imageUploaded'), severity: 'success' });
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : t('blog.imageUploadError'), 
        severity: 'error' 
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title[post.language as keyof typeof post.title] || '',
        content: post.content[post.language as keyof typeof post.content] || '',
        excerpt: post.excerpt[post.language as keyof typeof post.excerpt] || '',
        category: post.category,
        tags: post.tags.join(', '),
        featuredImage: post.featuredImage,
        isPublished: post.isPublished,
        isFeatured: post.isFeatured,
        seoTitle: post.seoTitle?.[post.language as keyof typeof post.seoTitle] || '',
        seoDescription: post.seoDescription?.[post.language as keyof typeof post.seoDescription] || '',
        seoKeywords: post.seoKeywords ? post.seoKeywords.join(', ') : '',
        language: post.language
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        featuredImage: '',
        isPublished: false,
        isFeatured: false,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        language: selectedLanguage
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbar({ ...snackbar, open: false });

    try {
      const url = editingPost 
        ? `http://localhost:5000/api/blog/${editingPost._id}`
        : 'http://localhost:5000/api/blog';
      
      const method = editingPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          seoKeywords: formData.seoKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
        })
      });

      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: editingPost ? t('blog.successUpdated') : t('blog.successCreated'), 
          severity: 'success' 
        });
        handleCloseDialog();
        fetchPosts();
        fetchStats();
      } else {
        throw new Error('Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      setSnackbar({ ...snackbar, open: true, message: t('blog.errorSaving'), severity: 'error' });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm(t('blog.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blog/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setSnackbar({ open: true, message: t('blog.successDeleted'), severity: 'success' });
        fetchPosts();
        fetchStats();
      } else {
        throw new Error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setSnackbar({ ...snackbar, open: true, message: t('blog.errorDeleting'), severity: 'error' });
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...post,
          isPublished: !post.isPublished
        })
      });

      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: post.isPublished ? 'Blog yazısı taslağa alındı' : 'Blog yazısı yayınlandı', 
          severity: 'success' 
        });
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      setSnackbar({ ...snackbar, open: true, message: 'Durum güncellenirken hata oluştu', severity: 'error' });
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...post,
          isFeatured: !post.isFeatured
        })
      });

      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: post.isFeatured ? 'Öne çıkan yazıdan kaldırıldı' : 'Öne çıkan yazı yapıldı', 
          severity: 'success' 
        });
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      setSnackbar({ ...snackbar, open: true, message: 'Durum güncellenirken hata oluştu', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('blog.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('blog.title')}
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small">
            <InputLabel>{t('blog.language')}</InputLabel>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              label={t('blog.language')}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('blog.addNew')}
        </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
          <Box flex="1" minWidth="200px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ArticleIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalPosts}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('blog.totalPosts')}
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
                  <ViewIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.publishedPosts}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('blog.publishedPosts')}
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
                  <LikeIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalViews}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('blog.totalViews')}
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
                  <CommentIcon color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalComments}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('blog.totalComments')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Blog Posts Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('blog.titleField')}</TableCell>
                <TableCell>{t('blog.category')}</TableCell>
                <TableCell>{t('blog.author')}</TableCell>
                <TableCell>{t('blog.language')}</TableCell>
                <TableCell>{t('blog.isPublished')}</TableCell>
                <TableCell>{t('blog.views')}</TableCell>
                <TableCell>{t('blog.likes')}</TableCell>
                <TableCell>{t('blog.comments')}</TableCell>
                <TableCell>{t('blog.date')}</TableCell>
                <TableCell>{t('blog.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" noWrap>
                        {post.title[post.language as keyof typeof post.title]}
                      </Typography>
                      {post.isFeatured && (
                        <Chip
                          icon={<StarIcon />}
                          label={t('blog.featured')}
                          size="small"
                          color="warning"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={post.category} size="small" />
                  </TableCell>
                  <TableCell>{post.author?.name}</TableCell>
                  <TableCell>
                    <Chip label={t(`blog.languages.${post.language}`)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.isPublished ? t('blog.published') : t('blog.draft')}
                      color={post.isPublished ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{post.viewCount}</TableCell>
                  <TableCell>{post.likes?.length || 0}</TableCell>
                  <TableCell>{post.comments?.length || 0}</TableCell>
                  <TableCell>
                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title={t('edit')}>
                        <IconButton size="small" onClick={() => handleOpenDialog(post)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={post.isPublished ? 'Taslağa Al' : 'Yayınla'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleTogglePublish(post)}
                          color={post.isPublished ? 'warning' : 'success'}
                        >
                          {post.isPublished ? <HideIcon /> : <ViewIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={post.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleFeatured(post)}
                          color={post.isFeatured ? 'warning' : 'default'}
                        >
                          {post.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('delete')}>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(post._id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingPost ? t('blog.editPost') : t('blog.addNew')}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" gap={2}>
              <Box flex="1">
            <TextField
                  label={t('blog.titleField')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
              </Box>
              <Box width="200px">
                <FormControl fullWidth>
                  <InputLabel>{t('blog.language')}</InputLabel>
                  <Select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    label={t('blog.language')}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <TextField
              label={t('blog.excerpt')}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('blog.category')}</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label={t('blog.category')}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label={t('blog.tags')}
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder="eğitim, teknoloji, bilim"
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('blog.featuredImage')}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={uploadingImage ? <CircularProgress size={20} /> : <UploadIcon />}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? t('blog.loading') : t('blog.selectImage')}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.featuredImage && (
                  <Box
                    component="img"
                    src={`http://localhost:5000${formData.featuredImage}`}
                    alt="Featured"
                    sx={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 1 }}
                  />
                )}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('blog.content')}
              </Typography>
              <Editor
                apiKey="oalels5mt4hun5wvxxbgv5kb3dy0cth5yninuh3t5t2w3rfy"
              value={formData.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | image | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  language: 'tr',
                  branding: false,
                  promotion: false
                }}
              />
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField
                label={t('blog.seoTitle')}
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                fullWidth
              />
              <TextField
                label={t('blog.seoKeywords')}
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                fullWidth
                placeholder="anahtar kelime 1, anahtar kelime 2"
              />
            </Box>
            
            <TextField
              label={t('blog.seoDescription')}
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            
            <Box display="flex" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                }
                label={t('blog.isPublished')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                }
                label={t('blog.isFeatured')}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPost ? t('common.update') : t('common.create')}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Blog; 