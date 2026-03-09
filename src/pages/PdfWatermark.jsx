import React, { useState, useRef, useCallback } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { FileText, Droplet, LayoutTemplate, Palette, Type, Stamp } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfWatermark.css';

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfWatermarkInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  
  // Settings
  const [position, setPosition] = useState('center'); // center, top-left, top-right, bottom-left, bottom-right
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(64);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const resultRef = useRef(null);

  const onDrop = useCallback((accepted) => {
    if (accepted?.length > 0) {
      setFile(accepted[0]);
      setPreviewUrl(null);
      setStatus(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  });

  const applyWatermark = async () => {
    if (!file) return;
    if (!watermarkText.trim()) {
      toast('Please enter watermark text.', 'warning');
      return;
    }
    
    setRunning(true);
    setProgress(5);
    setStatus({ type: 'processing', msg: 'Loading PDF document...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        let x = 0;
        let y = 0;
        const margin = 50;

        // Calculate Position
        if (position === 'center') {
          x = (width / 2) - (textWidth / 2);
          y = (height / 2) - (textHeight / 2);
        } else if (position === 'top-left') {
          x = margin;
          y = height - textHeight - margin;
        } else if (position === 'top-right') {
          x = width - textWidth - margin;
          y = height - textHeight - margin;
        } else if (position === 'bottom-left') {
          x = margin;
          y = margin;
        } else if (position === 'bottom-right') {
          x = width - textWidth - margin;
          y = margin;
        }

        // Adjust for rotation anchoring visually
        let rotateObj = degrees(rotation);
        
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5), // Grey text
          opacity: opacity,
          rotate: rotateObj,
        });

        setProgress(Math.round(((i + 1) / totalPages) * 95));
      }

      setStatus({ type: 'processing', msg: 'Finalizing watermarks...' });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Watermark successfully stamped on all pages!' });
      toast('Watermark applied successfully!', 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error(err);
      toast('Failed to process. PDF may be encrypted.', 'error');
      setStatus({ type: 'error', msg: 'Processing failed' });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setStatus(null); setProgress(0);
  };

  return (
    <div className="pdf-watermark-page">
      <SEO 
        title="Best PDF Watermark Online – Add Text & Image Watermarks Free"
        description="The #1 tool to add text or image watermarks to your PDF documents instantly. Protect your brand and prevent unauthorized use. 100% Private & browser-based."
        keywords="add watermark to pdf, best pdf watermarker, text watermark pdf free, image watermark pdf online, protect pdf copyright, brand pdf documents"
        canonicalPath="/pdf-watermark"
        ogImage="/og/pdf-watermark.jpg"
      />

      <ToolHeader 
        title="Watermark" 
        highlight="PDF" 
        badge="🛡️ Brand Protection"
        icon={<Stamp size={24} />}
        desc="Stamp your identity onto your documents. Secure, client-side watermarking that keeps your sensitive files on your device."
      />

      <ToolGrid>
        <Panel 
          title="Step 1: Upload PDF" 
          className={`grid-full ${file ? 'compact' : ''}`}
          headerActions={file && <ResetBtn onClick={reset} size="sm" />}
        >
          <div className="uploader-flex-container">
            <div {...getRootProps()} className={`dropzone-refined ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dz-content">
                <div className="dz-icon-wrap">
                  <FileText size={file ? 20 : 40} />
                </div>
                <h3>{file ? 'Change PDF File' : 'Drop PDF here or click to upload'}</h3>
                {!file && <p>Select document to brand with a watermark</p>}
              </div>
            </div>
            {file && (
              <div className="file-meta-pill animate-in">
                <FileText size={16} />
                <span>{file.name} — {fmtBytes(file.size)}</span>
              </div>
            )}
          </div>
        </Panel>

        {file && (
          <Panel title="Step 2: Watermark Settings" className="grid-full numbers-settings-panel">
            <div className="settings-flex-layout">
              <div className="settings-grid stamp-grid">
                
                <div className="input-field wide-col">
                  <label>
                    <Type size={14} className="lbl-icon" /> Watermark Text
                  </label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder="e.g. CONFIDENTIAL"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                </div>

                <div className="input-field">
                  <label><LayoutTemplate size={14} className="lbl-icon" /> Position</label>
                  <select className="modern-input select" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="center">Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>

                <div className="input-field">
                  <label><Palette size={14} className="lbl-icon" /> Font Size ({fontSize}px)</label>
                  <div className="slider-wrap inline-slider">
                    <input 
                      type="range" 
                      className="slider" 
                      min="12" max="150" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label>Rotation ({rotation}°)</label>
                  <div className="slider-wrap inline-slider">
                    <input 
                      type="range" 
                      className="slider" 
                      min="0" max="360" step="15"
                      value={rotation} 
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="input-field">
                  <label>Opacity ({Math.round(opacity * 100)}%)</label>
                  <div className="slider-wrap inline-slider">
                    <input 
                      type="range" 
                      className="slider" 
                      min="0.1" max="1.0" step="0.1"
                      value={opacity} 
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="action-stack-wide">
                <Btn 
                  variant="primary" 
                  onClick={applyWatermark} 
                  loading={running} 
                  disabled={running || !watermarkText.trim()}
                  full={false}
                  className="btn-watermark-final"
                >
                   <Droplet size={18} style={{ marginRight: 8 }} />
                   Stamp Watermark
                </Btn>
              </div>
              
              {running && <div className="progress-wrap"><ProgressBar value={progress} /></div>}
              <StatusBar status={status} />
            </div>
          </Panel>
        )}

        <Panel title="Step 3: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {!previewUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Droplet size={40} />
                  </div>
                  <p>Configure your watermark settings and apply to view the result.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Watermarked PDF Preview"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill success-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Operation Successful</span>
                      <span className="pill-subtitle">Ready to save</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`watermarked_${file.name}`} full={false} style={{ padding: '12px 28px' }}>
                Download Watermarked PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="0987654321" />

      <SEOContent title="Best Tool to Brand Your PDFs Fast">
        <p>Whether you're protecting intellectual property with "CONFIDENTIAL", or marking pre-release documents with "DRAFT", our <strong>Add Watermark to PDF</strong> tool handles it instantly.</p>

        <h3>Extensive Typography Control</h3>
        <p>Customize exactly how your text appears. Scale it massive to cover the entire page diagonally, or keep it small and tasteful in the corner. Adjust opacity to ensure the underlying text remains perfectly legible.</p>

        <h3>Private and Secure</h3>
        <p>Your documents are never sent across the internet. The watermarking algorithms run locally directly within your browser. You can confidently stamp internal memos, legal drafts, and sensitive materials without risk of upload leaks.</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Is it possible to remove the watermark later?', a: 'Once the PDF is saved and distributed, the text is embedded into the page stream. While advanced specific editors might remove vector text, for basic viewers it is permanent.' },
        { q: 'Can I add a picture as a watermark instead?', a: 'Currently, this lightweight local tool focuses specifically on crisp, vector text watermarks to keep processing speed instant.' },
        { q: 'Will this increase my file size horizontally?', a: 'No, text watermarks add virtually zero megabytes to your document size because they are vector instructions rather than massive raster images.' }
      ]} />
    </div>
  );
}

export default function PdfWatermark() {
  return (
    <ToastProvider>
      <PdfWatermarkInner />
    </ToastProvider>
  );
}
