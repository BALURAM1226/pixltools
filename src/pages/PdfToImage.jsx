import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Control, Select, Slider, Btn,
  ResetBtn, StatusBar, ProgressBar, InfoChips, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import { FileImage, Download, FileText } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfToImage.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfToImageInner() {
  const toast = useToast();

  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  
  const [format, setFormat] = useState('image/jpeg');
  const [scale, setScale] = useState(2); // DPI multiplier (2 = ~144dpi, 3 = ~216dpi)
  const [quality, setQuality] = useState(0.85);
  
  const [results, setResults] = useState([]); // { url, pageNum, name }
  const [zipUrl, setZipUrl] = useState(null);
  
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const resultRef = useRef(null);

  /* ── dropzone ─────────────────────────────────────────── */
  const onDrop = useCallback(async (accepted) => {
    if (accepted?.length > 0) {
      const f = accepted[0];
      setRunning(true);
      setStatus({ type: 'processing', msg: 'Reading PDF structure...' });
      
      try {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        setFile(f);
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);
        setResults([]);
        setZipUrl(null);
        toast(`PDF Loaded: ${pdf.numPages} pages detected.`, 'success');
        setStatus(null);
      } catch (err) {
        console.error(err);
        toast('Failed to load PDF. It might be password protected or corrupt.', 'error');
        setStatus({ type: 'error', msg: 'Load failed' });
      } finally {
        setRunning(false);
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  });

  /* ── convert ──────────────────────────────────────────── */
  const convertToImages = async () => {
    if (!pdfDoc) return;
    setRunning(true);
    setResults([]);
    setZipUrl(null);
    setProgress(0);
    setStatus({ type: 'processing', msg: 'Starting conversion...' });

    try {
      const zip = new JSZip();
      const outputList = [];
      const total = pdfDoc.numPages;
      const ext = format === 'image/png' ? 'png' : 'jpg';

      for (let i = 1; i <= total; i++) {
        setProgress(Math.round(((i - 1) / total) * 90));
        setStatus({ type: 'processing', msg: `Rendering page ${i} of ${total}...` });

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise(resolve => {
          canvas.toBlob(b => resolve(b), format, quality);
        });

        const url = URL.createObjectURL(blob);
        const name = `page-${i}.${ext}`;
        
        outputList.push({ url, pageNum: i, name });
        zip.file(name, blob);
      }

      setStatus({ type: 'processing', msg: 'Bundling ZIP file...' });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zUrl = URL.createObjectURL(zipBlob);
      
      setResults(outputList);
      setZipUrl(zUrl);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Conversion Complete!' });
      toast(`Successfully converted ${total} pages!`, 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: `Error: ${err.message}` });
      toast('Conversion failed during rendering.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    results.forEach(r => URL.revokeObjectURL(r.url));
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setFile(null); setPdfDoc(null); setPageCount(0); setResults([]); setZipUrl(null); setStatus(null); setProgress(0);
  };

  const downloadAll = () => {
    if (!zipUrl) return;
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `${file.name.replace('.pdf', '')}_images.zip`;
    link.click();
    toast('Download started!', 'success');
  };

  return (
    <div className="pdf-to-img-page">
      <SEO
        title="Best PDF to Image Converter – Extract PDF to JPG/PNG Free"
        description="Convert PDF pages to high-quality JPG or PNG images instantly. Fast, private, browser-side extraction with custom DPI and quality settings. 100% Safe."
        keywords="pdf to image, best pdf to jpg converter, extract pdf to png, pdf converter to image free, high resolution pdf to jpg"
        canonicalPath="/pdf-to-image"
        ogImage="/og/pdf-to-image.jpg"
      />

      <ToolHeader
        title="PDF to"
        highlight="Image"
        badge="🖼️ HD Rendering"
        desc="Turn every page of your PDF into a high-quality JPG or PNG image instantly. Perfect for presentations, social media, and quick previews."
      />

      <ToolGrid>
        {/* Step 1: Upload */}
        <Panel title="Step 1: Upload PDF">
          {!file ? (
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dz-active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dz-inner">
                <div className="dz-icon-wrap">
                  <FileText className="dz-icon" size={40} />
                </div>
                <div className="dz-text">
                  <p className="dz-label">{isDragActive ? 'Drop PDF here' : 'Click or Drag PDF here'}</p>
                  <p className="dz-sub">Max file size: 100MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-stack">
              <div className="summary-bar" style={{ margin: 0 }}>
                <div className="summary-info">
                  <div className="stat-item">
                    <span className="stat-label">File Name</span>
                    <span className="stat-value" style={{ fontSize: '0.9rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pages</span>
                    <span className="stat-value">{pageCount}</span>
                  </div>
                </div>
                <div className="reset-wrap" style={{ marginTop: 0 }}>
                 <ResetBtn onClick={reset} />
                </div>
              </div>
              
              <InfoChips items={[
                  { label: "File Size", value: fmtBytes(file.size) },
                  { label: "PDF Library", value: "PDF.js" }
              ]} />
            </div>
          )}
        </Panel>

        {/* Step 2: Settings */}
        <Panel title="Step 2: Conversion Settings">
          {!file ? (
              <div className="tips-panel">
                <div className="tip-item">
                  <span className="tip-icon">✨</span>
                  <div>
                    <strong>High-Definition:</strong> Choose up to 300 DPI equivalent for professional print quality.
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">📦</span>
                  <div>
                    <strong>Auto ZIP:</strong> Multiple pages are automatically bundled into a single ZIP file for convenience.
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔒</span>
                  <div>
                    <strong>Local & Private:</strong> Your documents are never uploaded. Privacy is our priority.
                  </div>
                </div>
              </div>
          ) : (
            <div className="settings-stack">
               <div className="settings-grid">
                  <Control label="Output Format">
                    <Select
                      value={format}
                      onChange={setFormat}
                      options={[
                        { value: 'image/jpeg', label: 'JPG (Smaller)' },
                        { value: 'image/png', label: 'PNG (Lossless)' }
                      ]}
                    />
                  </Control>
                  <Control label="Render Scale" hint={`${scale}x (${72 * scale} DPI)`}>
                    <Slider
                      min={1} max={4} step={0.5}
                      value={scale}
                      onChange={setScale}
                      formatValue={v => `${v}x`}
                    />
                  </Control>
               </div>

               {format === 'image/jpeg' && (
                  <Control label="JPEG Quality" hint={`${Math.round(quality * 100)}%`}>
                    <Slider
                      min={0.5} max={1.0} step={0.05}
                      value={quality}
                      onChange={setQuality}
                      formatValue={v => `${Math.round(v * 100)}%`}
                    />
                  </Control>
               )}

               <div className="action-stack">
                 <Btn onClick={convertToImages} loading={running} disabled={running}>
                   🚀 Convert PDF to Images
                 </Btn>
                 <StatusBar status={status} />
                 {running && <ProgressBar value={progress} />}
               </div>
            </div>
          )}
        </Panel>

        {/* Step 3: Result */}
        <Panel title="Step 3: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {results.length === 0 ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <FileImage size={40} />
                  </div>
                  <p>Convert your PDF to see the page-by-page previews here.</p>
                </div>
             ) : (
               <div className="result-grid-scroll">
                  {results.map((r, idx) => (
                    <div key={idx} className="rendered-page-card">
                      <div className="page-thumb-wrap">
                        <img src={r.url} alt={r.name} loading="lazy" />
                      </div>
                      <div className="page-info">
                        <span className="page-num-badge">PAGE {r.pageNum}</span>
                        <a href={r.url} download={r.name} className="page-download-btn" title="Download this page">
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {results.length > 0 && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Render Complete</span>
                      <span className="pill-subtitle">{results.length} pages processed</span>
                  </div>
              </div>
              <Btn variant="success" onClick={downloadAll} full={false} className="btn-premium-download" style={{ padding: '12px 28px' }}>
                <Download size={18} style={{ marginRight: 8 }} />
                Download All (ZIP)
              </Btn>
            </div>
          )}
        </Panel>

      </ToolGrid>


       <AdBanner slot="7777777777" />

       <SEOContent title="How to Convert PDF to High-Quality Images Free">
          <p>Converting document pages into image formats like JPG or PNG is essential for sharing content on social media, embedding in presentations, or viewing on devices that do not have a dedicated PDF reader. iLoveToolHub offers a <strong>premium-grade PDF to Image converter</strong> that runs entirely in your browser.</p>

          <h3>Professional Image Rendering</h3>
          <p>Most basic converters produce blurry images by rendering them at a standard 72 DPI. Our tool allows you to increase the <strong>Render Scale</strong> up to 4x (equivalent to ~288 DPI), ensuring that even the smallest text and complex diagrams remain sharp and readable.</p>

          <h3>Choosing the Right Format: JPG vs PNG</h3>
          <ul>
            <li><strong>JPG:</strong> Best for photographs and complex documents. It uses lossy compression to keep file sizes small while maintaining visual fidelity.</li>
            <li><strong>PNG:</strong> Best for text-heavy documents, logos, or diagrams. It uses lossless compression, ensuring no artifacts are added to the text edges.</li>
          </ul>

          <h3>Why Use iLoveToolHub?</h3>
          <div className="best-practices-grid">
              <div className="practice-card">
                  <h5>Maximum Privacy</h5>
                  <p>Unlike other converters, your PDF NEVER leaves your computer. All rendering happens locally using your browser's processing power.</p>
              </div>
              <div className="practice-card">
                  <h5>Batch Processing</h5>
                  <p>Convert 100+ pages in a single click. We auto-generate a ZIP archive so you don't have to download images one by one.</p>
              </div>
              <div className="practice-card">
                  <h5>Device Compatibility</h5>
                  <p>Images are universally readable. Convert your PDF to JPG to ensure anyone can view your content on any smartphone or tablet.</p>
              </div>
              <div className="practice-card">
                  <h5>Zero Cost</h5>
                  <p>High-resolution extraction without subscriptions, daily limits, or watermarks. Forever 100% free.</p>
              </div>
          </div>
       </SEOContent>

       <FAQ items={[
          { q: 'Is the output quality as good as the original PDF?', a: 'Yes! We use high-resolution rendering (2x or 3x scale) to ensure the images are crisp. You can adjust the "Render Scale" in Step 2 for even higher quality.' },
          { q: 'Does this tool work with password-protected PDFs?', a: 'Currently, the tool works only with non-encrypted PDFs. If your PDF has a password, please unlock it first using a decryption tool.' },
          { q: 'What happens to my files?', a: 'Nothing. Everything happens locally in your browser memory. We never upload your PDF to any server, making it safe for bank statements and legal papers.' },
          { q: 'What is the "Render Scale"?', a: 'Standard screens show PDFs at 1x scale (72 DPI). Increasing the scale to 2x or 3x multiplies the number of pixels, creating a much sharper "High Definition" image suitable for printing.' }
       ]} />
    </div>
  );
}

export default function PdfToImage() {
  return <ToastProvider><PdfToImageInner /></ToastProvider>;
}
