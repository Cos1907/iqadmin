import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Alert } from '@mui/material';
import { CloudUpload, Delete, Image } from '@mui/icons-material';

interface FileUploadProps {
  onFileSelect: (file: File | File[]) => void;
  onFileRemove: (index?: number) => void;
  acceptedFiles?: string[];
  maxSize?: number;
  multiple?: boolean;
  value?: File | File[] | null;
  label?: string;
  helperText?: string;
  recommendedSize?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onFileRemove, 
  acceptedFiles = ['image/*'], 
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  value = null,
  label = 'Resim Yükle',
  helperText = 'Resim dosyasını sürükleyip bırakın veya tıklayarak seçin',
  recommendedSize = '400x300px'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Dosya sayısı kontrolü
    if (!multiple && fileArray.length > 1) {
      setError('Sadece bir dosya seçebilirsiniz');
      return;
    }

    // Dosya türü kontrolü
    const invalidFiles = fileArray.filter(file => {
      return !acceptedFiles.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type;
      });
    });

    if (invalidFiles.length > 0) {
      setError('Geçersiz dosya türü. Sadece resim dosyaları kabul edilir.');
      return;
    }

    // Dosya boyutu kontrolü
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`Dosya boyutu ${maxSize / (1024 * 1024)}MB'dan küçük olmalıdır`);
      return;
    }

    // Dosyaları işle
    if (multiple) {
      onFileSelect(fileArray);
    } else {
      onFileSelect(fileArray[0]);
    }
  };

  const handleRemove = (index?: number) => {
    if (index !== undefined && Array.isArray(value)) {
      // Çoklu dosya için belirli bir dosyayı kaldır
      onFileRemove(index);
    } else {
      // Tek dosya veya tüm dosyaları kaldır
      onFileRemove();
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileName = () => {
    if (Array.isArray(value)) {
      return value[0]?.name || '';
    }
    return (value as File)?.name || '';
  };

  const getFileSize = () => {
    if (Array.isArray(value)) {
      return value[0]?.size || 0;
    }
    return (value as File)?.size || 0;
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedFiles.join(',')}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      
      <Paper
        variant="outlined"
        sx={{
          border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? '#f5f5f5' : 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f5f5f5'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {value ? (
          <Box>
            {multiple && Array.isArray(value) ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Seçilen Dosyalar ({value.length})
                </Typography>
                {value.map((file, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Image sx={{ mr: 1, color: '#666' }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {file.name} ({formatFileSize(file.size)})
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image sx={{ mr: 2, fontSize: 40, color: '#666' }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {getFileName()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatFileSize(getFileSize())}
                  </Typography>
                </Box>
                <IconButton 
                  sx={{ ml: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {label}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {helperText}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Maksimum dosya boyutu: {maxSize / (1024 * 1024)}MB
            </Typography>
            {recommendedSize && (
              <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                Önerilen boyut: {recommendedSize}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload; 