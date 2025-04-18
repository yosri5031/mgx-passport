// src/utils/faceDetection.js
import { FaceDetection } from '@mediapipe/face_detection';

let faceDetector = null;
let faceDetectionResults = null;

const loadFaceDetector = async () => {
  if (!faceDetector) {
    faceDetector = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
    });
    
    await faceDetector.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5
    });
    
    faceDetector.onResults((results) => {
      faceDetectionResults = results;
      if (results.detections && results.detections.length > 0) {
        console.log('Face detected:', results.detections[0]);
      }
    });

    await faceDetector.initialize();
  }
  return faceDetector;
};

export const detectFace = async (videoElement) => {
  try {
    const detector = await loadFaceDetector();
    await detector.send({image: videoElement});
    
    if (!faceDetectionResults || !faceDetectionResults.detections || faceDetectionResults.detections.length === 0) {
      console.log('No face detected');
      return {
        faceDetected: false,
        correctPosition: false,
        goodLighting: false,
        facePosition: null
      };
    }

    const detection = faceDetectionResults.detections[0];
    const boundingBox = detection.boundingBox;
    
    // Calculate face metrics and position
    const centerX = boundingBox.xCenter;
    const centerY = boundingBox.yCenter;
    const width = boundingBox.width;
    const height = boundingBox.height;
    
    // Check face position and size
    const isCenter = Math.abs(centerX - 0.5) < 0.15 && Math.abs(centerY - 0.5) < 0.15;
    const isCorrectSize = width > 0.2 && width < 0.8 && height > 0.2 && height < 0.8;
    
    // Estimate lighting conditions
    const goodLighting = checkLighting(videoElement);

    console.log('Face position:', { centerX, centerY, width, height });
    console.log('Position check:', { isCenter, isCorrectSize });

    return {
      faceDetected: true,
      correctPosition: isCenter && isCorrectSize,
      goodLighting,
      facePosition: {
        x: centerX,
        y: centerY,
        size: Math.max(width, height)
      }
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return {
      faceDetected: false,
      correctPosition: false,
      goodLighting: false,
      facePosition: null
    };
  }
};

function checkLighting(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let brightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  brightness = brightness / (data.length / 4);
  
  return brightness > 100 && brightness < 200;
}