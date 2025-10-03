import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageUpload } from '../../hooks/useImageUpload';

const ImageUpload = ({ onImageUpload, onClose }) => {
  const [preview, setPreview] = useState(null);
  const { uploadImage, uploading, uploadProgress } = useImageUpload();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload image
      const result = await uploadImage(file);
      
      if (result.success) {
        onImageUpload(result.data);
      } else {
        // Show error or handle failed upload
        console.error('Upload failed:', result.error);
        setPreview(null);
      }
      
      // Cleanup preview URL
      URL.revokeObjectURL(previewUrl);
    }
  }, [uploadImage, onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Share Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploading ? (
            <div className="text-center py-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 mt-4">Uploading your image...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
            </div>
          ) : preview ? (
            <div className="text-center">
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
              </div>
              <p className="text-sm text-gray-600">Processing image...</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {/* Upload Icon */}
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop to upload' : 'Upload an image'}
              </h4>
              
              <p className="text-gray-600 mb-4">
                {isDragActive 
                  ? 'Release to upload your image' 
                  : 'Drag & drop an image here, or click to browse'
                }
              </p>
              
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-500">
                  <strong>Supported formats:</strong> JPG, PNG, GIF, WebP
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Max size:</strong> 5MB
                </p>
              </div>

              {/* Browse Button */}
              {!isDragActive && (
                <button
                  type="button"
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Browse Files
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!uploading && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            {preview && !uploading && (
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Choose Different
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;