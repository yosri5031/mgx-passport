// src/components/Camera.jsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import PhotoGuide from './PhotoGuide';
import ValidationOverlay from './ValidationOverlay';
import { detectFace } from '../utils/faceDetection';

const Camera = ({ onPhotoCapture, country }) => {
  const webcamRef = useRef(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [detectionInitialized, setDetectionInitialized] = useState(false);
  const [validationState, setValidationState] = useState({
    faceDetected: false,
    correctPosition: false,
    goodLighting: false,
    facePosition: null
  });

  // Add a reference for the interval and animation frame
  const intervalRef = useRef(null);
  const animationFrameRef = useRef(null);

  const videoConstraints = {
    facingMode: isFrontCamera ? 'user' : 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onPhotoCapture(imageSrc);
      }
    }
  }, [onPhotoCapture]);

  const toggleCamera = () => {
    // Clear previous detection interval when switching cameras
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset validation state
    setValidationState({
      faceDetected: false,
      correctPosition: false,
      goodLighting: false,
      facePosition: null
    });
    
    // Toggle camera
    setIsFrontCamera(!isFrontCamera);
    setCameraReady(false);
  };

  const checkFacePosition = async () => {
    if (webcamRef.current && webcamRef.current.video) {
      const video = webcamRef.current.video;
      if (video.readyState === 4) {  // Check if video is ready
        try {
          const detectionResult = await detectFace(video);
          setValidationState(prevState => ({
            ...detectionResult,
            // Keep previous lighting state if not detected
            goodLighting: detectionResult.goodLighting !== undefined 
              ? detectionResult.goodLighting 
              : prevState.goodLighting
          }));
        } catch (error) {
          console.error('Error in face detection:', error);
        }
      }
    }
  };

  // Initialize face detection when camera is ready
  const handleCameraReady = useCallback(() => {
    console.log('Camera ready');
    setCameraReady(true);
    
    // Wait a bit to make sure video is fully initialized
    setTimeout(() => {
      checkFacePosition().then(() => {
        setDetectionInitialized(true);
      });
    }, 1000);
  }, []);

  // Set up continuous face detection
  useEffect(() => {
    const startDetection = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        // Clear any existing intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Start new detection interval
        intervalRef.current = setInterval(checkFacePosition, 300); // Check every 300ms
        return true;
      }
      return false;
    };
    
    if (cameraReady && detectionInitialized) {
      if (!startDetection()) {
        // If camera not ready yet, retry in a moment
        const checkReadyInterval = setInterval(() => {
          if (startDetection()) {
            clearInterval(checkReadyInterval);
          }
        }, 500);
        
        // Clean up this interval if component unmounts
        return () => clearInterval(checkReadyInterval);
      }
    }
    
    return () => {
      // Clean up interval on effect cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cameraReady, detectionInitialized]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative rounded-lg overflow-hidden border-2 border-[#4A90E2]">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleCameraReady}
          className="w-full"
          mirrored={isFrontCamera}
        />
        <PhotoGuide country={country} facePosition={validationState.facePosition} />
        <ValidationOverlay state={validationState} />
        
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
              <p className="mt-2">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={toggleCamera}
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={!cameraReady}
        >
          Switch Camera
        </button>
        <button
          onClick={handleCapture}
          disabled={!validationState.faceDetected || !validationState.correctPosition || !cameraReady}
          className={`px-6 py-2 rounded font-medium ${
            validationState.faceDetected && validationState.correctPosition && cameraReady
              ? 'bg-[#2ECC71] text-white'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Capture Photo
        </button>
      </div>
      
      {/* Camera permission error message */}
      {!cameraReady && detectionInitialized && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p>Camera not available. Please check your camera permissions and make sure no other app is using your camera.</p>
        </div>
      )}
    </div>
  );
};

export default Camera;