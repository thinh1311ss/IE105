import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import ImageUpload from './components/ImageUpload';
import VideoUpload from './components/VideoUpload';
import WebcamCapture from './components/WebcamCapture';
import ResultFire from './components/ResultFire';
import ResultNoFire from './components/ResultNoFire';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/image" element={<ImageUpload />} />
        <Route path="/video" element={<VideoUpload />} />
        <Route path="/webcam" element={<WebcamCapture />} />
        <Route path="/result" element={<ResultFire />} />
        <Route path="/final" element={<ResultNoFire />} />
      </Routes>
    </Router>
  );
}

export default App;