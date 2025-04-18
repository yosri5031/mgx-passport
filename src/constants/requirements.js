// src/constants/requirements.js
export const requirements = {
  US: {
    dimensions: {
      width: 600, // 2 inches at 300 DPI
      height: 600 // 2 inches at 300 DPI
    },
    headSize: {
      min: 300, // 1 inch at 300 DPI
      max: 412  // 1.375 inches at 300 DPI
    },
    instructions: "Center your face, maintain neutral expression, no glasses",
    criteria: [
      "Face must be in full view",
      "Neutral facial expression",
      "Eyes open and clearly visible",
      "No headwear (except religious purposes)",
      "Plain white background"
    ]
  },
  CA: {
    dimensions: {
      width: 827, // 70mm at 300 DPI
      height: 1181 // 100mm at 300 DPI
    },
    headSize: {
      min: 366, // 31mm at 300 DPI
      max: 425  // 36mm at 300 DPI
    },
    instructions: "Look straight at camera, neutral expression, ensure good lighting",
    criteria: [
      "Face directly facing camera",
      "Neutral facial expression",
      "Eyes open and clearly visible",
      "No glasses",
      "White or off-white background"
    ]
  }
};