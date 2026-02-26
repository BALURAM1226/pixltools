import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';

const ImageConverter = lazy(() => import('./pages/ImageConverter'));
const PassportPhoto = lazy(() => import('./pages/PassportPhoto'));
const ImageToPdf = lazy(() => import('./pages/ImageToPdf'));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'));
const BgRemover = lazy(() => import('./pages/BgRemover'));
const ImageResizer = lazy(() => import('./pages/ImageResizer'));
const Base64Converter = lazy(() => import('./pages/Base64Converter'));
const OCR = lazy(() => import('./pages/OCR'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: 16, color: 'var(--text-muted)'
    }}>
      <div className="spinner spinner-lg" />
      <span style={{ fontSize: '0.9rem' }}>Loading tool…</span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/passport-photo" element={<PassportPhoto />} />
            <Route path="/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/background-remover" element={<BgRemover />} />
            <Route path="/image-resizer" element={<ImageResizer />} />
            <Route path="/base64-converter" element={<Base64Converter />} />
            <Route path="/ocr" element={<OCR />} />
          </Routes>
        </Suspense>
      </Layout>
    </ThemeProvider>
  );
}
