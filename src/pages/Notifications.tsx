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
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'test_result' | 'system';
  recipients: 'all' | 'specific' | 'category';
  userIds: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  category: string;
  isRead: boolean;
  isSent: boolean;
  scheduledFor: string;
  sentAt: string;
  actionUrl: string;
  actionText: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt: string;
  createdAt: string;
}

interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  pendingNotifications: number;
  scheduledNotifications: number;
  typeStats: Array<{
    _id: string;
    count: number;
  }>;
  priorityStats: Array<{
    _id: string;
    count: number;
  }>;
  recentActivity: Notification[];
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    recipients: 'all' as Notification['recipients'],
    userIds: [] as string[],
    category: '',
    scheduledFor: '',
    actionUrl: '',
    actionText: '',
    priority: 'medium' as Notification['priority'],
    expiresAt: ''
  });

  const notificationTypes = [
    { value: 'info', label: t('notifications.types.info'), icon: <InfoIcon />, color: 'info' },
    { value: 'success', label: t('notifications.types.success'), icon: <SuccessIcon />, color: 'success' },
    { value: 'warning', label: t('notifications.types.warning'), icon: <WarningIcon />, color: 'warning' },
    { value: 'error', label: t('notifications.types.error'), icon: <ErrorIcon />, color: 'error' },
    { value: 'promotion', label: t('notifications.types.promotion'), icon: <NotificationsIcon />, color: 'primary' },
    { value: 'test_result', label: t('notifications.types.test_result'), icon: <AnalyticsIcon />, color: 'secondary' },
    { value: 'system', label: t('notifications.types.system'), icon: <NotificationsIcon />, color: 'default' }
  ];

  const priorities = [
    { value: 'low', label: t('notifications.priorities.low'), color: 'default' },
    { value: 'medium', label: t('notifications.priorities.medium'), color: 'primary' },
    { value: 'high', label: t('notifications.priorities.high'), color: 'warning' },
    { value: 'urgent', label: t('notifications.priorities.urgent'), color: 'error' }
  ];

  const categories = [
    t('notifications.categories.general'),
    t('notifications.categories.education'),
    t('notifications.categories.technology'),
    t('notifications.categories.health'),
    t('notifications.categories.sports'),
    t('notifications.categories.science'),
    t('notifications.categories.culture')
  ];

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setSnackbar({ open: true, message: t('notifications.errorLoading'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/stats/overview', {
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpenDialog = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        recipients: notification.recipients,
        userIds: notification.userIds.map(u => u._id),
        category: notification.category || '',
        scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor).toISOString().slice(0, 16) : '',
        actionUrl: notification.actionUrl || '',
        actionText: notification.actionText || '',
        priority: notification.priority,
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        userIds: [],
        category: '',
        scheduledFor: '',
        actionUrl: '',
        actionText: '',
        priority: 'medium',
        expiresAt: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNotification(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingNotification 
        ? `http://localhost:5000/api/notifications/${editingNotification._id}`
        : 'http://localhost:5000/api/notifications';
      
      const method = editingNotification ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
        })
      });

      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: editingNotification ? t('notifications.successUpdated') : t('notifications.successCreated'), 
          severity: 'success' 
        });
        handleCloseDialog();
        fetchNotifications();
        fetchStats();
      } else {
        throw new Error('Failed to save notification');
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      setSnackbar({ open: true, message: t('notifications.errorSaving'), severity: 'error' });
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!window.confirm(t('notifications.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setSnackbar({ open: true, message: t('notifications.successDeleted'), severity: 'success' });
        fetchNotifications();
        fetchStats();
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({ open: true, message: t('notifications.errorDeleting'), severity: 'error' });
    }
  };

  const handleSendNow = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setSnackbar({ open: true, message: t('notifications.successSent'), severity: 'success' });
        fetchNotifications();
        fetchStats();
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setSnackbar({ open: true, message: t('notifications.errorSending'), severity: 'error' });
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    const typeInfo = notificationTypes.find(t => t.value === type);
    return typeInfo?.icon || <InfoIcon />;
  };

  const getTypeColor = (type: Notification['type']) => {
    const typeInfo = notificationTypes.find(t => t.value === type);
    return typeInfo?.color || 'default';
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const priorityInfo = priorities.find(p => p.value === priority);
    return priorityInfo?.color || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('notifications.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('notifications.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('notifications.addNew')}
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
          <Box flex="1" minWidth="200px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <NotificationsIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalNotifications}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('notifications.totalNotifications')}
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
                  <SendIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.sentNotifications}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('notifications.sentNotifications')}
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
                  <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.pendingNotifications}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('notifications.pendingNotifications')}
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
                  <ScheduleIcon color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats.scheduledNotifications}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('notifications.scheduledNotifications')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Notifications Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('notifications.titleField')}</TableCell>
                <TableCell>{t('notifications.type')}</TableCell>
                <TableCell>{t('notifications.recipients')}</TableCell>
                <TableCell>{t('notifications.priority')}</TableCell>
                <TableCell>{t('notifications.status')}</TableCell>
                <TableCell>{t('notifications.scheduling')}</TableCell>
                <TableCell>{t('notifications.date')}</TableCell>
                <TableCell>{t('notifications.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" noWrap>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {notification.message}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(notification.type)}
                      label={notificationTypes.find(t => t.value === notification.type)?.label}
                      color={getTypeColor(notification.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        notification.recipients === 'all' ? t('notifications.allUsers') :
                        notification.recipients === 'specific' ? `${notification.userIds.length} ${t('notifications.users')}` :
                        notification.category
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={priorities.find(p => p.value === notification.priority)?.label}
                      color={getPriorityColor(notification.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.isSent ? t('notifications.sent') : t('notifications.pending')}
                      color={notification.isSent ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {notification.scheduledFor ? (
                      <Typography variant="body2">
                        {new Date(notification.scheduledFor).toLocaleString('tr-TR')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {t('notifications.immediate')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title={t('edit')}>
                        <IconButton size="small" onClick={() => handleOpenDialog(notification)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {!notification.isSent && (
                        <Tooltip title={t('notifications.sendNow')}>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleSendNow(notification._id)}
                          >
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('delete')}>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(notification._id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNotification ? t('notifications.editNotification') : t('notifications.addNew')}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label={t('notifications.titleField')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label={t('notifications.message')}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>{t('notifications.type')}</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Notification['type'] })}
                  label={t('notifications.type')}
                >
                  {notificationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>{t('notifications.priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Notification['priority'] })}
                  label={t('notifications.priority')}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>{t('notifications.recipients')}</InputLabel>
              <Select
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value as Notification['recipients'] })}
                label={t('notifications.recipients')}
              >
                <MenuItem value="all">{t('notifications.allUsers')}</MenuItem>
                <MenuItem value="specific">{t('notifications.specificUsers')}</MenuItem>
                <MenuItem value="category">{t('notifications.category')}</MenuItem>
              </Select>
            </FormControl>
            
            {formData.recipients === 'specific' && (
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={users.filter(user => formData.userIds.includes(user._id))}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, userIds: newValue.map(u => u._id) });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('notifications.users')}
                    placeholder={t('notifications.selectUsers')}
                  />
                )}
              />
            )}
            
            {formData.recipients === 'category' && (
              <FormControl fullWidth>
                <InputLabel>{t('notifications.category')}</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label={t('notifications.category')}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <Box display="flex" gap={2}>
              <TextField
                label={t('notifications.scheduledFor')}
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('notifications.expiresAt')}
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <TextField
              label={t('notifications.actionUrl')}
              value={formData.actionUrl}
              onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
              fullWidth
              placeholder="https://example.com"
            />
            
            <TextField
              label={t('notifications.actionText')}
              value={formData.actionText}
              onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
              fullWidth
              placeholder="Detayları Görüntüle"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('notifications.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingNotification ? t('notifications.update') : t('notifications.create')}
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

export default Notifications; 