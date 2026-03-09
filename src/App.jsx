import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';

const ImageConverter = lazy(() => import('./pages/ImageConverter'));
const PassportPhoto = lazy(() => import('./pages/PassportPhoto'));
const ImageToPdf = lazy(() => import('./pages/ImageToPdf'));
const PdfMerge = lazy(() => import('./pages/PdfMerge'));
const PdfSplitter = lazy(() => import('./pages/PdfSplitter'));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'));
const BgRemover = lazy(() => import('./pages/BgRemover'));
const ImageResizer = lazy(() => import('./pages/ImageResizer'));
const Base64Converter = lazy(() => import('./pages/Base64Converter'));
const OCR = lazy(() => import('./pages/OCR'));
const QRCodeGenerator = lazy(() => import('./pages/QRCodeGenerator'));
const JSONFormatter = lazy(() => import('./pages/JSONFormatter'));
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator'));
const UnitConverter = lazy(() => import('./pages/UnitConverter'));
const SecretKeyGenerator = lazy(() => import('./pages/SecretKeyGenerator'));
const HashtagGenerator = lazy(() => import('./pages/HashtagGenerator'));
const ColorContrastChecker = lazy(() => import('./pages/ColorContrastChecker'));
const HtmlWcagValidator = lazy(() => import('./pages/HtmlWcagValidator'));
const UrlEncoderDecoder = lazy(() => import('./pages/UrlEncoderDecoder'));
const CssUnitConverter = lazy(() => import('./pages/CssUnitConverter'));
const JwtDebugger = lazy(() => import('./pages/JwtDebugger'));
const DiffChecker = lazy(() => import('./pages/DiffChecker'));
const PdfToImage = lazy(() => import('./pages/PdfToImage'));
const PdfCompressor = lazy(() => import('./pages/PdfCompressor'));
const PdfOrganizer = lazy(() => import('./pages/PdfOrganizer'));
const HtmlToPdf = lazy(() => import('./pages/HtmlToPdf'));
const PdfRemovePages = lazy(() => import('./pages/PdfRemovePages'));
const PdfProtect = lazy(() => import('./pages/PdfProtect'));
const PdfPageNumbers = lazy(() => import('./pages/PdfPageNumbers'));
const PdfWatermark = lazy(() => import('./pages/PdfWatermark'));
const PdfSign = lazy(() => import('./pages/PdfSign'));



/* Legal & Info Pages */
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 16, color: 'var(--text-muted)'
      }}
    >
      <div className="spinner spinner-lg" aria-hidden="true" />
      <span style={{ fontSize: '0.9rem' }}>Loading tool…</span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/image-converter" element={<ImageConverter />} />
              <Route path="/passport-photo" element={<PassportPhoto />} />
              <Route path="/image-to-pdf" element={<ImageToPdf />} />
              <Route path="/pdf-merge" element={<PdfMerge />} />
              <Route path="/pdf-splitter" element={<PdfSplitter />} />
              <Route path="/image-compressor" element={<ImageCompressor />} />
              <Route path="/background-remover" element={<BgRemover />} />
              <Route path="/image-resizer" element={<ImageResizer />} />
              <Route path="/base64-converter" element={<Base64Converter />} />
              <Route path="/ocr" element={<OCR />} />
              <Route path="/qr-generator" element={<QRCodeGenerator />} />
              <Route path="/json-formatter" element={<JSONFormatter />} />
              <Route path="/password-generator" element={<PasswordGenerator />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              <Route path="/secret-generator" element={<SecretKeyGenerator />} />
              <Route path="/hashtag-generator" element={<HashtagGenerator />} />
              <Route path="/color-contrast-checker" element={<ColorContrastChecker />} />
              <Route path="/html-wcag-validator" element={<HtmlWcagValidator />} />
              <Route path="/url-encoder-decoder" element={<UrlEncoderDecoder />} />
              <Route path="/css-unit-converter" element={<CssUnitConverter />} />
              <Route path="/jwt-debugger" element={<JwtDebugger />} />
              <Route path="/diff-checker" element={<DiffChecker />} />
              <Route path="/pdf-to-image" element={<PdfToImage />} />
              <Route path="/pdf-compress" element={<PdfCompressor />} />
              <Route path="/pdf-organize" element={<PdfOrganizer />} />
              <Route path="/html-to-pdf" element={<HtmlToPdf />} />
              <Route path="/pdf-remove-pages" element={<PdfRemovePages />} />
              <Route path="/pdf-protect" element={<PdfProtect />} />
              <Route path="/pdf-page-numbers" element={<PdfPageNumbers />} />
              <Route path="/pdf-watermark" element={<PdfWatermark />} />
              <Route path="/pdf-sign" element={<PdfSign />} />


              {/* Legal & Info Routes */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
