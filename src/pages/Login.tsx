import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('asil@nevo.com');
  const [password, setPassword] = useState('asil123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Login form submitted');

    if (!email || !password) {
      setError(t('loginError') || 'E-posta ve şifre gerekli');
      return;
    }

    console.log('Attempting login with:', { email, password });

    const success = await login(email, password);
    console.log('Login result:', success);
    
    if (success) {
      console.log('Login successful, navigating to dashboard');
      navigate('/');
    } else {
      console.log('Login failed, showing error');
      setError(t('loginError') || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF9900 0%, #FF6B35 100%)',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FF9900 0%, #FF6B35 100%)',
              color: 'white',
              textAlign: 'center',
              py: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <img 
                src="/whitelogo.png" 
                alt="IQ Testim Logo" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  marginRight: '16px',
                  borderRadius: '10px'
                }} 
              />
              <Typography variant="h4" component="h1" fontWeight="bold">
                IQ Testim
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Admin Panel Girişi
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 4,
            }}
          >
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label={t('email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label={t('password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #FF9900 0%, #FF6B35 100%)',
                  color: 'white',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E68A00 0%, #E55A2B 100%)',
                  },
                }}
              >
                {loading ? t('loading') : t('loginButton')}
              </Button>
            </form>
          </Paper>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 