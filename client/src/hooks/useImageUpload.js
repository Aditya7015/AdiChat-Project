import { useState } from 'react';
import { uploadAPI } from '../services/api';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      console.log('🖼️ Starting image upload:', file.name, file.type, file.size);

      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await uploadAPI.uploadImage(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Image upload successful:', response.data);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Image upload error:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload image'
      };
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadImage,
    uploading,
    uploadProgress
  };
};