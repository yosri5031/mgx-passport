// src/App.jsx
import React, { useState } from 'react';
import Camera from './components/Camera';
import PhotoPreview from './components/PhotoPreview';

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('US');

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-[#4A90E2] p-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">FreezePix Passport Photo</h1>
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="mt-2 px-3 py-1 rounded bg-white text-gray-800"
          >
            <option value="US">US Passport</option>
            <option value="CA">Canadian Passport</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {!capturedImage ? (
          <Camera 
            onPhotoCapture={setCapturedImage} 
            country={selectedCountry}
          />
        ) : (
          <PhotoPreview 
            image={capturedImage}
            country={selectedCountry}
            onRetake={() => setCapturedImage(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;