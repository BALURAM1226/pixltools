import React, { useState, useRef, useCallback } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { FileText, Hash } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfPageNumbers.css';

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfPageNumbersInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  
  // Settings
  const [position, setPosition] = useState('bottom-center'); // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
  const [format, setFormat] = useState('Page {n}'); // {n} or {n} of {total}
  const [startNumber, setStartNumber] = useState(1);
  const [margin, setMargin] = useState(30);

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

  const generatePageNumbers = async () => {
    if (!file) return;
    setRunning(true);
    setProgress(5);
    setStatus({ type: 'processing', msg: 'Loading PDF document...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        const currentNumber = startNumber + i;
        let textToDraw = format.replace('{n}', currentNumber).replace('{total}', totalPages);

        const fontSize = 12;
        const textWidth = helveticaFont.widthOfTextAtSize(textToDraw, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        let x = margin;
        let y = margin; // bottom is 0

        // Calculate X position
        if (position.includes('center')) {
          x = (width / 2) - (textWidth / 2);
        } else if (position.includes('right')) {
          x = width - textWidth - margin;
        }

        // Calculate Y position
        if (position.includes('top')) {
          y = height - textHeight - margin;
        }

        page.drawText(textToDraw, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0), // Black text
        });

        setProgress(Math.round(((i + 1) / totalPages) * 95));
      }

      setStatus({ type: 'processing', msg: 'Validating & saving PDF...' });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Page numbers added successfully!' });
      toast('Page numbers successfully added!', 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error(err);
      toast('Failed to process PDF. It may be encrypted or corrupted.', 'error');
      setStatus({ type: 'error', msg: 'Failed to add numbers' });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setStatus(null); setProgress(0);
  };

  return (
    <div className="pdf-page-numbers-page">
      <SEO 
        title="#1 Add Page Numbers to PDF Online Free – Customize PDF Pagination"
        description="The best tool to insert page numbers into PDF documents online. Choose positions, formats, and start numbering locally in your browser. 100% Secure and Private."
        keywords="add page numbers to pdf, best pdf numbering tool, insert pdf pagination free, pdf page numberer online, customize pdf page numbers"
        canonicalPath="/pdf-page-numbers"
        ogImage="/og/pdf-page-numbers.jpg"
      />

      <ToolHeader 
        title="Add Page Numbers" 
        highlight="PDF" 
        badge="🔢 Custom Pagination"
        icon={<Hash size={24} />}
        desc="Stamp page numbers securely onto your documents. Client-side processing ensures complete privacy and high precision."
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
                {!file && <p>Select document to add page numbers</p>}
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
          <Panel title="Step 2: Numbering Settings" className="grid-full numbers-settings-panel">
            <div className="settings-flex-layout">
              <div className="settings-grid">
                <div className="input-group">
                  <label>Position</label>
                  <select className="modern-input select" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Format</label>
                  <select className="modern-input select" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="{n}">1, 2, 3...</option>
                    <option value="Page {n}">Page 1, Page 2...</option>
                    <option value="{n} of {total}">1 of 10...</option>
                    <option value="Page {n} of {total}">Page 1 of 10...</option>
                    <option value="- {n} -">- 1 -</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Start Number From</label>
                  <input 
                    type="number" 
                    className="modern-input" 
                    value={startNumber}
                    min="1"
                    onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="input-group">
                  <label>Margin (px)</label>
                  <input 
                    type="number" 
                    className="modern-input" 
                    value={margin}
                    min="0"
                    onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="action-stack-wide">
                <Btn 
                  variant="primary" 
                  onClick={generatePageNumbers} 
                  loading={running} 
                  disabled={running}
                  full={false}
                  className="btn-numbers-final"
                >
                   <Hash size={18} style={{ marginRight: 8 }} />
                   Add Page Numbers
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
                    <Hash size={40} />
                  </div>
                  <p>Configure settings and click "Add Page Numbers" to generate.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Numbered Pages PDF Preview"
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
              <DownloadBtn href={previewUrl} filename={`numbered_${file.name}`} full={false} style={{ padding: '12px 28px' }}>
                Download Numbered PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="1234567890" />

      <SEOContent title="Best Free Tool to Add Page Numbers to PDFs">
        <p>Whether you're compiling legal documents, academic papers, or business reports, keeping your pages properly numbered is essential. Our <strong>Add Page Numbers to PDF</strong> tool makes it incredibly easy to insert customized pagination globally across your file.</p>

        <h3>Complete Customization</h3>
        <p>You can choose exactly where the numbers appear: Top right, bottom center, or any of the four corners. Additionally, customize the formatting. Do you prefer reading "Page 1 of 5", "1", or simply "- 1 -"? We support all common numbering formats.</p>

        <h3>100% Privacy Secure</h3>
        <p>This tool modifies your PDF <strong>locally in your web browser</strong> using advanced JavaScript libraries. This means your confidential paperwork is never uploaded to external servers, protecting your sensitive data from interception or unauthorized storage.</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Will inserting page numbers decrease the quality of my PDF?', a: 'No. The numbering is embedded at the metadata level explicitly as text. It does not rasterize or reduce the resolution of your existing document.' },
        { q: 'Can I start numbering from a specific number?', a: 'Yes! You can use the "Start Number From" setting to begin the numbering sequence at whatever page you need. Perfect for document continuations.' },
        { q: 'Is this tool safe for confidential files?', a: 'Absolutely. All processing occurs locally on your own device. The PDF securely remains within your browser at all times.' }
      ]} />
    </div>
  );
}

export default function PdfPageNumbers() {
  return (
    <ToastProvider>
      <PdfPageNumbersInner />
    </ToastProvider>
  );
}
