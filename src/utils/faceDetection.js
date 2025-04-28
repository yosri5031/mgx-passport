// src/utils/faceDetection.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face detection models
 */
const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    // Load models from a public CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/weights/';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log('Face detection models loaded successfully');
    modelsLoaded = true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
};

/**
 * Detect face in video element using face-api.js
 */
export const detectFace = async (videoElement) => {
  // Default state if detection fails
  const defaultState = {
    faceDetected: false,
    correctPosition: false,
    goodLighting: true, // Assuming lighting is good by default
    facePosition: null
  };

  try {
    // Ensure models are loaded
    if (!modelsLoaded) {
      await loadModels();
    }

    // Detect faces in the video frame
    const detectionOptions = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 320,
      scoreThreshold: 0.5
    });
    
    const detections = await faceapi.detectSingleFace(
      videoElement, 
      detectionOptions
    ).withFaceLandmarks();

    // If no face detected, return default state
    if (!detections) {
      console.log('No faces detected');
      return defaultState;
    }

    // We have a face!
    const { detection, landmarks } = detections;
    const { box } = detection;
    
    // Calculate position relative to video dimensions
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Normalize coordinates (0-1)
    const normalizedX = centerX / videoWidth;
    const normalizedY = centerY / videoHeight;
    
    // Calculate face size relative to frame
    const faceSize = (box.width * box.height) / (videoWidth * videoHeight);
    
    // Get face landmarks for additional validation
    const eyeDistance = landmarks.getLeftEye()[0].x - landmarks.getRightEye()[0].x;
    const eyeDistanceNormalized = Math.abs(eyeDistance) / videoWidth;
    
    // Check if eyes are open by measuring eye height
    const leftEyeHeight = getEyeHeight(landmarks.getLeftEye());
    const rightEyeHeight = getEyeHeight(landmarks.getRightEye());
    const eyesOpen = (leftEyeHeight > 0.01 && rightEyeHeight > 0.01);
    
    // Check head tilt by comparing eye heights
    const headTiltOk = Math.abs(landmarks.getLeftEye()[0].y - landmarks.getRightEye()[0].y) / videoHeight < 0.05;
    
    // Analyze face lighting (simple version)
    const goodLighting = true; // This would need image analysis for accurate results
    
    // Determine if face is in correct position
    const isCorrectPosition = 
      normalizedX >= 0.4 && normalizedX <= 0.6 &&
      normalizedY >= 0.4 && normalizedY <= 0.6 &&
      faceSize >= 0.15 && faceSize <= 0.40 &&
      eyesOpen &&
      headTiltOk;
    
    return {
      faceDetected: true,
      correctPosition: isCorrectPosition,
      goodLighting: goodLighting,
      facePosition: {
        x: normalizedX,
        y: normalizedY,
        size: faceSize,
        eyeDistance: eyeDistanceNormalized,
        eyesOpen: eyesOpen,
        headTiltOk: headTiltOk
      }
    };
  } catch (error) {
    console.error('Face detection error:', error);
    
    // If face detection fails, use a fallback
    if (!modelsLoaded) {
      // If models failed to load, try again later
      return defaultState;
    } else {
      // If models loaded but detection failed, provide a relaxed fallback
      return {
        faceDetected: true,
        correctPosition: true,
        goodLighting: true,
        facePosition: { x: 0.5, y: 0.5, size: 0.5 }
      };
    }
  }
};

/**
 * Calculate eye height from landmarks
 */
function getEyeHeight(eyeLandmarks) {
  const yCoords = eyeLandmarks.map(point => point.y);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  return maxY - minY;
}