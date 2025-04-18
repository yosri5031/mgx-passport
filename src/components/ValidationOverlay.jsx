// src/components/ValidationOverlay.jsx
import React from 'react';

const ValidationOverlay = ({ state }) => {
  const getMessage = () => {
    if (!state.faceDetected) {
      return "📷 No face detected - Look directly at the camera";
    }
    
    if (state.facePosition) {
      const { x, y, size } = state.facePosition;
      if (x < 0.4) return "⬅️ Move your face right";
      if (x > 0.6) return "➡️ Move your face left";
      if (y < 0.4) return "⬇️ Move your face down";
      if (y > 0.6) return "⬆️ Move your face up";
      if (size < 0.3) return "↗️ Move closer to the camera";
      if (size > 0.7) return "↙️ Move farther from the camera";
    }
    
    if (!state.correctPosition) return "📏 Center your face in the guide";
    if (!state.goodLighting) return "💡 Improve lighting conditions";
    return "✨ Perfect! Hold still to capture";
  };

  const getStatusColor = () => {
    if (!state.faceDetected) return "#E74C3C";
    if (!state.correctPosition || !state.goodLighting) return "#F1C40F";
    return "#2ECC71";
  };

  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center">
      <div 
        className="px-4 py-2 rounded-full"
        style={{ 
          backgroundColor: getStatusColor(),
          color: 'white',
          opacity: 0.9
        }}
      >
        {getMessage()}
      </div>
    </div>
  );
};

export default ValidationOverlay;