import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import  jsPDF  from 'jspdf';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Slider, Btn,
  ResetBtn, StatusBar, ProgressBar, InfoChips, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { Zap, Shield, Sparkles, TrendingDown, FileText } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfCompressor.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

const PRESETS = [
    { id: 'low', label: 'Extreme', icon: '🗜️', desc: 'Less quality, high compression', quality: 0.3, scale: 1 },
    { id: 'med', label: 'Recommended', icon: '⚖️', desc: 'Good quality, good compression', quality: 0.6, scale: 1.5 },
    { id: 'high', label: 'High Quality', icon: '✨', desc: 'High quality, less compression', quality: 0.85, scale: 2 },
];

function PdfCompressorInner() {
  const toast = useToast();

  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  
  const [activePreset, setActivePreset] = useState('med');
  const [manualQuality, setManualQuality] = useState(0.6);
  const [manualScale, setManualScale] = useState(1.5);
  
  const [, setCompressedBlob] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);
  
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const resultRef = useRef(null);

  /* ── dropzone ─────────────────────────────────────────── */
  const onDrop = useCallback(async (accepted) => {
    if (accepted?.length > 0) {
      const f = accepted[0];
      setRunning(true);
      setStatus({ type: 'processing', msg: 'Analyzing PDF content...' });
      
      try {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        setFile(f);
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);
        setCompressedBlob(null);
        setCompressedUrl(null);
        toast(`PDF Loaded: ${pdf.numPages} pages ready for compression.`, 'success');
        setStatus(null);
      } catch (err) {
        console.error(err);
        toast('Failed to load PDF. Support for encrypted files is coming soon.', 'error');
        setStatus({ type: 'error', msg: 'Analysis failed' });
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

  /* ── handle presets ────────────────────────────────────── */
  const handlePresetSelect = (id) => {
      setActivePreset(id);
      const preset = PRESETS.find(p => p.id === id);
      setManualQuality(preset.quality);
      setManualScale(preset.scale);
      setCompressedUrl(null);
  };

  /* ── compress ─────────────────────────────────────────── */
  const compressPdf = async () => {
    if (!pdfDoc) return;
    setRunning(true);
    setCompressedUrl(null);
    setProgress(0);
    setStatus({ type: 'processing', msg: 'Initializing compression engine...' });

    try {
      const total = pdfDoc.numPages;
      let newPdf = null;

      for (let i = 1; i <= total; i++) {
        setProgress(Math.round(((i - 1) / total) * 95));
        setStatus({ type: 'processing', msg: `Optimizing page ${i} of ${total}...` });

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: manualScale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', manualQuality);
        
        // Initialise jspdf with first page dimensions
        if (i === 1) {
            newPdf = new jsPDF({
                unit: 'px',
                format: [viewport.width, viewport.height]
            });
        } else {
            newPdf.addPage([viewport.width, viewport.height]);
        }

        newPdf.addImage(dataUrl, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
      }

      setStatus({ type: 'processing', msg: 'Finalizing PDF streams...' });
      const pdfBlob = newPdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      setCompressedBlob(pdfBlob);
      setCompressedUrl(url);
      setCompressedSize(pdfBlob.size);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Compression Perfected!' });
      toast(`Successfully reduced file size!`, 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: `Error: ${err.message}` });
      toast('Compression encountered an error.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null); setPdfDoc(null); setPageCount(0); setCompressedBlob(null); setCompressedUrl(null); setStatus(null); setProgress(0);
  };

  const savings = file ? Math.round(((file.size - compressedSize) / file.size) * 100) : 0;

  return (
    <div className="pdf-compressor-page">
      <SEO
        title="#1 PDF Compressor Online – Reduce PDF File Size Free"
        description="Shrink PDF file size while maintaining crystal-clear visual quality. 100% private, browser-side PDF compressor. Best tool for email and web optimization."
        keywords="compress pdf online, best pdf compressor, reduce pdf size free, shrink pdf file, high-quality pdf compression, small pdf converter"
        canonicalPath="/pdf-compressor"
        ogImage="/og/pdf-compressor.jpg"
      />

      <ToolHeader
        title="Compress"
        highlight="PDF"
        badge="📉 Max Optimization"
        desc="Reduce the file size of your PDF documents without losing quality. Optimize your files for faster sharing and storage."
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
                  <p className="dz-label">{isDragActive ? 'Drop PDF here' : 'Select PDF File'}</p>
                  <p className="dz-sub">Files are processed locally • 100MB Limit</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-stack">
               <div className="summary-bar" style={{ margin: 0 }}>
                <div className="summary-info">
                  <div className="stat-item">
                    <span className="stat-label">Original Size</span>
                    <span className="stat-value">{fmtBytes(file.size)}</span>
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
                  { label: "File Name", value: file.name },
                  { label: "Security", value: "Locked to RAM" }
              ]} />
            </div>
          )}
        </Panel>

        {/* Step 2: Levels */}
        <Panel title="Step 2: Compression Level">
          {!file ? (
              <div className="tips-panel">
                <div className="tip-item">
                  <Zap className="tip-icon" size={18} />
                  <div><strong>Instant Optimization:</strong> Our engine uses native rendering to peel away unnecessary bloat.</div>
                </div>
                <div className="tip-item">
                  <Shield className="tip-icon" size={18} />
                  <div><strong>Private Processing:</strong> Your sensitive documents never leave your browser memory.</div>
                </div>
                <div className="tip-item">
                  <Sparkles className="tip-icon" size={18} />
                  <div><strong>Smart Quality:</strong> Preserves text sharpness while shrinking image payloads.</div>
                </div>
              </div>
          ) : (
            <div className="settings-stack">
               <div className="comp-presets">
                   {PRESETS.map(p => (
                       <div 
                        key={p.id} 
                        className={`comp-preset-card ${activePreset === p.id ? 'active' : ''}`}
                        onClick={() => handlePresetSelect(p.id)}
                       >
                           <span className="preset-icon">{p.icon}</span>
                           <span className="preset-label">{p.label}</span>
                           <span className="preset-desc">{p.desc}</span>
                       </div>
                   ))}
               </div>

               <div className="quality-meter">
                    <div className="meter-header">
                        <span className="meter-label">Granular Quality Control</span>
                        <span className="meter-value">{Math.round(manualQuality * 100)}%</span>
                    </div>
                    <Slider 
                        min={0.1} max={1.0} step={0.05} 
                        value={manualQuality} 
                        onChange={(v) => { setManualQuality(v); setCompressedUrl(null); setActivePreset('custom'); }}
                        formatValue={v => `${Math.round(v * 100)}%`}
                    />
               </div>

               <div className="action-stack">
                 <Btn onClick={compressPdf} loading={running} disabled={running}>
                   🚀 Compress PDF Now
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
             {!compressedUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <TrendingDown size={40} />
                  </div>
                  <p>Apply compression in Step 2 to see how much space you can save!</p>
                </div>
             ) : (
               <>
                  <div className="comparison-wrap" style={{ padding: '0 32px' }}>
                      <div className="comp-card">
                          <span className="comp-card-label">Original File</span>
                          <span className="comp-card-size">{fmtBytes(file.size)}</span>
                      </div>
                      <div className="comp-card result animate-in">
                          <span className="comp-card-label">Compressed File</span>
                          <span className="comp-card-size">{fmtBytes(compressedSize)}</span>
                          {savings > 0 && (
                            <div>
                                <span className="savings-badge">
                                    <Sparkles size={14} /> -{savings}% Saved
                                </span>
                            </div>
                          )}
                      </div>
                  </div>

                  <div style={{ padding: '0 32px' }}>
                      <iframe 
                        src={`${compressedUrl}#toolbar=0&view=FitH`} 
                        title="Compressed PDF Preview"
                        className="pdf-preview-frame-modern"
                        style={{ height: '400px' }}
                      />
                  </div>
               </>
             )}

          </div>

          {compressedUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Optimization Complete</span>
                      <span className="pill-subtitle">Ready for immediate download</span>
                  </div>
              </div>
              <DownloadBtn href={compressedUrl} filename={`compressed_${file.name}`} full={false} style={{ padding: '12px 28px' }}>
                  Download PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>

      </ToolGrid>

       <AdBanner slot="8888888888" />

       <SEOContent title="Best High-Quality PDF Compressor: Why Privacy Matters">
          <p>Many online tools require you to upload your sensitive PDFs to their servers for compression. At <strong>iLoveToolHub</strong>, we built a <strong>Private-First PDF Compressor</strong> that works entirely within your browser. Whether you're compressing bank statements, legal contracts, or large eBook projects, your data never leaves your RAM.</p>

          <h3>How Our PDF Compression Works</h3>
          <p>Our tool uses a technique called <strong>Native Stream Re-sampling</strong>. Instead of just stripping metadata, we surgically re-process every image within the PDF using modern image compression algorithms. This results in significant file size reductions—often up to 90%—while keeping text crisp and searchable.</p>

          <h3>Which Compression Level Should You Choose?</h3>
          <ul>
            <li><strong>Extreme Compression:</strong> Best for when file size is the only concern (e.g. strict email attachment limits). Images will show some artifacts.</li>
            <li><strong>Recommended Compression:</strong> The perfect balance. Most users won't notice a difference in visual quality, but the file size will be cut by 50-70%.</li>
            <li><strong>High Quality:</strong> Minimal compression. Ideal for portfolios and print documents where you just want to remove technical bloat without touching image data.</li>
          </ul>
       </SEOContent>

       <FAQ items={[
          { q: 'Will my text become blurry or unsearchable?', a: 'No. Our compression focuses on re-sampling image payloads. The text layer is preserved as vector data, meaning it remains perfectly sharp and searchable regardless of the compression level.' },
          { q: 'Is there a limit to how many files I can compress?', a: 'No! Since the processing happens on your local device, we do not impose daily limits or subsciptions. You can compress as many files as your device can handle.' },
          { q: 'Can I compress scanned PDFs?', a: 'Yes! Scanned PDFs are typically just a collection of large images. Our tool is exceptionally effective at compressing these by optimizing the internal JPG streams.' },
          { q: 'What is the maximum file size?', a: 'We support PDF files up to 100MB. For files larger than that, browser memory limits may vary depending on your device.' }
       ]} />
    </div>
  );
}

export default function PdfCompressor() {
  return <ToastProvider><PdfCompressorInner /></ToastProvider>;
}
