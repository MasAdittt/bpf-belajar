import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const PhotoUploader = ({ title, onFileSelect, initialPhoto }) => {
    const [preview, setPreview] = useState(initialPhoto);
    const [isDragging, setIsDragging] = useState(false);
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes to match Personal component
  
    const validateFile = (file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size too large. Maximum 5MB');
        return false;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
        return false;
      }
      return true;
    };
  
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
  
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        if (validateFile(file)) {
          handleFile(file);
        }
      }
    };
  
    const handleFile = (file) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
          if (onFileSelect) onFileSelect(file);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && validateFile(file)) {
        handleFile(file);
      }
    };
  
    const handleRemove = (e) => {
      e.stopPropagation();
      setPreview(null);
      if (onFileSelect) onFileSelect(null);
    };
  
    return (
      <Box sx={{ width: '100%', mb: 3, position: 'relative' }}>
        <Box
          component="label"
          sx={{
            width: '100%',
            height: 200,
            border: '2px solid',
            borderColor: isDragging ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isDragging ? 'grey.50' : 'background.paper',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'grey.50',
            },
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              left: 16,
              px: 1,
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
  
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {preview ? (
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                  marginLeft: '40px',
                  marginTop: '20px',
                  display: 'block',
                }}
              />
              <IconButton
                onClick={handleRemove}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'common.white',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    opacity: 1,
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" color="primary" sx={{ textAlign: 'center' }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                PNG, JPG or GIF (max. 5MB)
              </Typography>
            </>
          )}
        </Box>
      </Box>
    );
  };
  
  const PhotoUploadForm = ({ onProfilePhotoSelect, onCoverPhotoSelect, initialProfilePhoto, initialCoverPhoto }) => {
    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          md: '1fr 1fr' 
        }, 
        gap: 3 
      }}>
        <PhotoUploader 
          title="Upload Profile Photo" 
          onFileSelect={onProfilePhotoSelect}
          initialPhoto={initialProfilePhoto}
        />
        <PhotoUploader 
          title="Upload Cover Photo" 
          onFileSelect={onCoverPhotoSelect}
          initialPhoto={initialCoverPhoto}
        />
      </Box>
    );
  };
  
  export default PhotoUploadForm;