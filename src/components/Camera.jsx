// src/components/Camera.jsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
// Remove the MediaPipe Camera import as it's causing the error
// import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import PhotoGuide from './PhotoGuide';
import ValidationOverlay from './ValidationOverlay';
import { detectFace } from '../utils/faceDetection';

// Remove the mediaCamera variable since we won't be using MediaPipe directly
// let mediaCamera = null;

const Camera = ({ onPhotoCapture, country }) => {
  const webcamRef = useRef(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [validationState, setValidationState] = useState({
    faceDetected: false,
    correctPosition: false,
    goodLighting: false,
    facePosition: null
  });

  // Add a reference for the interval
  const intervalRef = useRef(null);

  const videoConstraints = {
    facingMode: isFrontCamera ? 'user' : 'environment',
    width: 1280,
    height: 720
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onPhotoCapture(imageSrc);
    }
  }, [onPhotoCapture]);

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const checkFacePosition = async () => {
    if (webcamRef.current && webcamRef.current.video) {
      const video = webcamRef.current.video;
      if (video.readyState === 4) {  // Check if video is ready
        try {
          console.log('Checking face position...');
          const detectionResult = await detectFace(video);
          console.log('Detection result:', detectionResult);
          setValidationState(detectionResult);
        } catch (error) {
          console.error('Error in face detection:', error);
        }
      }
    }
  };

  // Replace MediaPipe Camera with a simple interval for face detection
  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      // Set up an interval to check face position periodically
      intervalRef.current = setInterval(checkFacePosition, 500); // Check every 500ms
    }

    return () => {
      // Clean up interval on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [webcamRef.current]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative rounded-lg overflow-hidden border-2 border-[#4A90E2]">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onPlay={checkFacePosition}
          className="w-full"
        />
        <PhotoGuide country={country} facePosition={validationState.facePosition} />
        <ValidationOverlay state={validationState} />
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={toggleCamera}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Switch Camera
        </button>
        <button
          onClick={handleCapture}
          disabled={!validationState.faceDetected || !validationState.correctPosition}
          className={`px-6 py-2 rounded font-medium ${
            validationState.faceDetected && validationState.correctPosition
              ? 'bg-[#2ECC71] text-white'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Capture Photo
        </button>
      </div>
    </div>
  );
};

export default Camera;