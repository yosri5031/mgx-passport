// src/utils/imageProcessing.js
export const removeBackground = async (imageUrl) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await loadImage(imageUrl);
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Simple background removal - replace with more sophisticated algorithm if needed
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert background pixels to white
    for (let i = 0; i < data.length; i += 4) {
      // Simple threshold-based background detection
      const isBackground = isBackgroundPixel(data[i], data[i + 1], data[i + 2]);
      if (isBackground) {
        data[i] = 255;     // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 255; // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Background removal failed:', error);
    return imageUrl;
  }
};

export const resizeImage = async (imageUrl, dimensions) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await loadImage(imageUrl);
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Draw image with proper scaling
    const scale = Math.min(
      dimensions.width / img.width,
      dimensions.height / img.height
    );
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (dimensions.width - scaledWidth) / 2;
    const y = (dimensions.height - scaledHeight) / 2;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Image resize failed:', error);
    return imageUrl;
  }
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function isBackgroundPixel(r, g, b) {
  const brightness = (r + g + b) / 3;
  const colorVariance = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
  return brightness > 240 && colorVariance < 15;
}