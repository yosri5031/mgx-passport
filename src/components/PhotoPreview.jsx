// src/components/PhotoPreview.jsx
import React, { useEffect, useState } from 'react';
import { removeBackground, resizeImage } from '../utils/imageProcessing';
import { requirements } from '../constants/requirements';

const PhotoPreview = ({ image, country, onRetake }) => {
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processImage = async () => {
      try {
        // Remove background
        const withoutBg = await removeBackground(image);
        // Resize according to country requirements
        const final = await resizeImage(withoutBg, requirements[country].dimensions);
        setProcessedImage(final);
      } catch (error) {
        console.error('Image processing failed:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [image, country]);

  return (
    <div className="max-w-2xl mx-auto">
      {isProcessing ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2] mx-auto"></div>
          <p className="mt-4">Processing your photo...</p>
        </div>
      ) : (
        <div>
          <div className="rounded-lg overflow-hidden border-2 border-[#4A90E2]">
            <img src={processedImage || image} alt="Passport" className="w-full" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={onRetake}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Retake Photo
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = processedImage || image;
                link.download = `passport_photo_${country}.jpg`;
                link.click();
              }}
              className="px-6 py-2 bg-[#2ECC71] text-white rounded"
            >
              Download Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPreview;