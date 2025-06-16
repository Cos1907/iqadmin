import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Subscriptions } from '@mui/icons-material';

const Plans: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to subscriptions page after a short delay
    const timer = setTimeout(() => {
      navigate('/subscriptions');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        {t('plans')}
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
        <Subscriptions sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Abonelik Planları
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Abonelik planları yönetimi için Subscriptions sayfasına yönlendiriliyorsunuz...
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/subscriptions')}
          sx={{ mr: 2 }}
        >
          Şimdi Git
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
        >
          Ana Sayfa
        </Button>
      </Paper>
    </Box>
  );
};

export default Plans; 