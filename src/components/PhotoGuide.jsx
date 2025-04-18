// src/components/PhotoGuide.jsx
import React from 'react';
import { requirements } from '../constants/requirements';

const PhotoGuide = ({ country, facePosition }) => {
  const currentRequirements = requirements[country];

  // Calculate guide position adjustments based on face position
  const getPositionGuide = () => {
    if (!facePosition) return null;
    
    const { x, y, size } = facePosition;
    const idealX = 0.5;
    const idealY = 0.5;
    const idealSize = 0.7; // Target face size relative to frame

    const guides = [];

    if (Math.abs(x - idealX) > 0.1) {
      guides.push(x < idealX ? 'Move right ➡️' : 'Move left ⬅️');
    }
    if (Math.abs(y - idealY) > 0.1) {
      guides.push(y < idealY ? 'Move down ⬇️' : 'Move up ⬆️');
    }
    if (Math.abs(size - idealSize) > 0.1) {
      guides.push(size < idealSize ? 'Move closer 🔍' : 'Move back 📷');
    }

    return guides;
  };

  const positionGuides = getPositionGuide();

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Face outline guide */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="border-2 border-dashed rounded-full transition-all duration-300"
          style={{
            width: '200px',
            height: '200px',
            opacity: 0.7,
            borderColor: facePosition ? 
              (Math.abs(facePosition.x - 0.5) < 0.1 && Math.abs(facePosition.y - 0.5) < 0.1 ? '#2ECC71' : '#F1C40F') : 
              '#4A90E2',
            transform: facePosition ? 
              `scale(${0.8 + Math.min(Math.abs(facePosition.size - 0.7), 0.2)})` : 
              'scale(1)'
          }}
        >
          {/* Inner guides */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 border border-[#4A90E2] border-dashed opacity-50" />
          </div>
          {/* Cross hair guides */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#4A90E2] opacity-30" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#4A90E2] opacity-30" />
        </div>
      </div>

      {/* Position guidance */}
      {positionGuides && positionGuides.length > 0 && (
        <div className="absolute top-4 left-0 right-0 flex justify-center space-x-4">
          {positionGuides.map((guide, index) => (
            <div 
              key={index}
              className="px-3 py-1 bg-[#4A90E2] text-white rounded-full text-sm"
            >
              {guide}
            </div>
          ))}
        </div>
      )}

      {/* Requirements text */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black bg-opacity-50 p-2">
        <p className="mb-1 font-medium">{currentRequirements.instructions}</p>
        <p className="text-xs opacity-75">Position your face within the circle guide</p>
      </div>
    </div>
  );
};

export default PhotoGuide;