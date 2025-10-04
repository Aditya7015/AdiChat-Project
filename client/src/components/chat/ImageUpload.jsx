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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-sm md:max-w-md w-full overflow-hidden border border-[#e9edef] mx-2">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-[#e9edef] bg-[#f0f2f5]">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#111b21]">Share Image</h3>
            <p className="text-xs md:text-sm text-[#667781] mt-1">Send a photo in your conversation</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 md:w-8 md:h-8 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {uploading ? (
            <div className="text-center py-6 md:py-8">
              {/* Animated Upload Progress */}
              <div className="relative inline-block mb-3 md:mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-[#e9edef] rounded-full"></div>
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#00a884] font-semibold text-sm">
                  {uploadProgress}%
                </div>
              </div>
              <p className="text-[#111b21] font-medium mb-1 md:mb-2 text-sm md:text-base">Uploading your image</p>
              <p className="text-[#667781] text-xs md:text-sm">Please wait while we process your photo</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#e9edef] rounded-full h-1.5 md:h-2 mt-3 md:mt-4">
                <div 
                  className="bg-[#00a884] h-1.5 md:h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs md:text-sm text-[#667781] mt-1 md:mt-2">{uploadProgress}%</p>
            </div>
          ) : preview ? (
            <div className="text-center">
              <div className="mb-4 md:mb-6 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 md:max-h-80 mx-auto rounded-lg md:rounded-xl shadow-lg border border-[#e9edef]"
                />
                <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  Preview
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-[#667781]">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#00a884] rounded-full animate-pulse"></div>
                <p className="text-xs md:text-sm">Processing image...</p>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 md:border-3 border-dashed rounded-xl md:rounded-2xl p-4 md:p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-[#00a884] bg-[#00a884]/5 scale-[1.02] shadow-lg' 
                  : 'border-[#e9edef] hover:border-[#00a884] hover:bg-[#f8f9fa]'
              }`}
            >
              <input {...getInputProps()} />
              
              {/* Upload Icon */}
              <div className="mb-3 md:mb-6">
                <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${
                  isDragActive ? 'bg-[#00a884] scale-110' : 'bg-[#f0f2f5]'
                }`}>
                  <svg className={`w-6 h-6 md:w-10 md:h-10 transition-all duration-300 ${
                    isDragActive ? 'text-white scale-110' : 'text-[#54656f]'
                  }`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <h4 className={`text-lg md:text-xl font-semibold mb-2 md:mb-3 transition-colors duration-300 ${
                isDragActive ? 'text-[#00a884]' : 'text-[#111b21]'
              }`}>
                {isDragActive ? '📸 Drop to upload' : '📷 Upload Photo'}
              </h4>
              
              <p className={`text-sm md:text-lg mb-3 md:mb-6 transition-colors duration-300 ${
                isDragActive ? 'text-[#00a884]' : 'text-[#667781]'
              }`}>
                {isDragActive 
                  ? 'Release to share this image' 
                  : 'Drag & drop or click to select'
                }
              </p>
              
              {/* File Info */}
              <div className="bg-[#f8f9fa] rounded-lg md:rounded-xl p-2 md:p-4 border border-[#e9edef]">
                <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="text-center">
                    <div className="text-[#111b21] font-medium">Formats</div>
                    <div className="text-[#667781]">JPG, PNG, WebP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#111b21] font-medium">Max Size</div>
                    <div className="text-[#667781]">5 MB</div>
                  </div>
                </div>
              </div>

              {/* Browse Button */}
              {!isDragActive && (
                <button
                  type="button"
                  className="mt-3 md:mt-6 bg-[#00a884] hover:bg-[#008069] text-white px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                >
                  Choose from device
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!uploading && (
          <div className="flex justify-end space-x-2 md:space-x-3 p-4 md:p-6 border-t border-[#e9edef] bg-[#f8f9fa]">
            <button
              onClick={onClose}
              className="px-3 md:px-6 py-1.5 md:py-2.5 text-[#667781] hover:text-[#111b21] font-medium transition-colors duration-200 hover:bg-white rounded-lg border border-transparent hover:border-[#e9edef] text-sm md:text-base"
            >
              Cancel
            </button>
            {preview && !uploading && (
              <button
                onClick={() => setPreview(null)}
                className="px-3 md:px-6 py-1.5 md:py-2.5 text-[#00a884] hover:text-[#008069] font-medium transition-colors duration-200 hover:bg-white rounded-lg border border-transparent hover:border-[#00a884] text-sm md:text-base"
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