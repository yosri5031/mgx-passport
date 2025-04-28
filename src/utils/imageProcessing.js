// src/utils/imageProcessing.js
import * as faceapi from 'face-api.js';

/**
 * Remove background from image using machine learning
 */
export const removeBackground = async (imageUrl) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await loadImage(imageUrl);
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Detect face to create a mask
    const detection = await faceapi.detectSingleFace(
      img, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();
    
    if (detection) {
      // Create a mask around the face
      const { box } = detection.detection;
      const faceX = box.x;
      const faceY = box.y;
      const faceWidth = box.width;
      const faceHeight = box.height;
      
      // Expand the area around the face (for hair, ears, etc.)
      const padding = Math.max(faceWidth, faceHeight) * 0.5;
      const maskX = Math.max(0, faceX - padding);
      const maskY = Math.max(0, faceY - padding * 1.2); // More padding on top for hair
      const maskWidth = Math.min(canvas.width - maskX, faceWidth + padding * 2);
      const maskHeight = Math.min(canvas.height - maskY, faceHeight + padding * 2);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply the mask - keep face area, make background white
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          
          // Check if pixel is within the face mask
          const inFaceMask = (
            x >= maskX && 
            x <= maskX + maskWidth && 
            y >= maskY && 
            y <= maskY + maskHeight
          );
          
          if (!inFaceMask) {
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 255; // A
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } else {
      // If face detection fails, use original image
      console.warn('Face detection failed for background removal');
    }
    
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Background removal failed:', error);
    return imageUrl; // Return original image if processing fails
  }
};

/**
 * Resize image to match passport requirements
 */
export const resizeImage = async (imageUrl, dimensions) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await loadImage(imageUrl);
    
    // Set canvas to target dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Detect face in the image to center it properly
    const detection = await faceapi.detectSingleFace(
      img, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();
    
    if (detection) {
      const { box } = detection.detection;
      const faceX = box.x + box.width / 2;
      const faceY = box.y + box.height / 2;
      
      // Calculate optimal scaling to fit passport requirements
      // Most passports require the head to take up 70-80% of the height
      const targetHeadHeight = dimensions.height * 0.7;
      const scale = targetHeadHeight / box.height;
      
      // Calculate positions to center the face
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center face in passport photo
      const targetFaceY = dimensions.height * 0.4; // Position face at 40% from top
      
      const x = dimensions.width / 2 - faceX * scale;
      const y = targetFaceY - faceY * scale;
      
      // Draw the image with proper positioning
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    } else {
      // Fallback if face detection fails - center the image
      console.warn('Face detection failed during resize');
      
      const scale = Math.min(
        dimensions.width / img.width,
        dimensions.height / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (dimensions.width - scaledWidth) / 2;
      const y = (dimensions.height - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    }
    
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Image resize failed:', error);
    return imageUrl; // Return original image if processing fails
  }
};

/**
 * Load an image and return a promise
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}