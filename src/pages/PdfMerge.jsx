import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn,
  ResetBtn, AdBanner, FAQ, SEOContent, DownloadBtn, StatusBar, ProgressBar, InfoChips
} from '../components/ToolShell';
import { Combine } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfMerge.css';

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfMergeInner() {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const resultRef = useRef(null);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length > 0) {
      toast('Please upload valid PDF files (max 100MB each).', 'error');
    }
    if (accepted?.length > 0) {
      const newFiles = accepted.map(f => ({
        file: f,
        name: f.name,
        size: f.size,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      toast(`${newFiles.length} PDF${newFiles.length > 1 ? 's' : ''} added`, 'success');
      setStatus(null);
      setPreviewUrl(null); // Reset preview if files change
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    maxSize: 100 * 1024 * 1024,
  });

  const removeFile = id => setFiles(prev => {
    const next = prev.filter(f => f.id !== id);
    if (next.length < 2) setPreviewUrl(null);
    return next;
  });
  
  const moveUp = i => {
    if (i === 0) return;
    setFiles(prev => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      setPreviewUrl(null);
      return next;
    });
  };

  const moveDown = i => {
    if (i === files.length - 1) return;
    setFiles(prev => {
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      setPreviewUrl(null);
      return next;
    });
  };

  const generatePDF = async () => {
    if (files.length < 2) {
      toast('Please add at least 2 PDF files to merge.', 'warning');
      return null;
    }
    
    setRunning(true);
    setProgress(10);
    setStatus({ type: 'processing', msg: 'Merging PDFs locally...' });

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i].file;
        setStatus({ type: 'processing', msg: `Processing document ${i + 1} of ${files.length}: ${file.name}` });
        
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(10 + Math.round(((i + 1) / files.length) * 70));
      }

      setStatus({ type: 'processing', msg: 'Almost done...' });
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      setProgress(100);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: `✗ Failed: ${err.message}` });
      toast('An error occurred while merging PDFs.', 'error');
      setProgress(0);
      return null;
    } finally {
      setRunning(false);
    }
  };

  const handlePreview = async () => {
    const url = await generatePDF();
    if (url) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setStatus({ type: 'success', msg: '✓ Preview generated! Scroll down to see it.' });
      toast('Preview ready!', 'success');
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };



  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles([]); setStatus(null); setProgress(0); setRunning(false); setPreviewUrl(null);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="pdf-merge-page">
      <SEO
        title="#1 Merge PDF Online – Combine Multiple PDFs Free"
        description="The best tool to merge and combine multiple PDF files into one instantly. 100% private, browser-side merging. No upload, no limits, no registration required."
        keywords="merge pdf online, best pdf merger, combine pdf files free, join pdf locally, secure pdf merger, combine documents into one pdf"
        canonicalPath="/pdf-merge"
        ogImage="/og/pdf-merge.jpg"
      />

      <ToolHeader
        title="Merge"
        highlight="PDF"
        badge="🔒 100% Private & Secure"
        desc="Combine multiple PDF documents into a single professional file instantly. High-fidelity merging that respects your privacy—no files ever leave your computer."
      />

      <ToolGrid>
        <Panel title="Step 1: Add PDF Files">
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dz-active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dz-inner">
              <div className="dz-icon-wrap">
                <svg className="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="dz-text">
                <p className="dz-label">{isDragActive ? 'Drop PDFs here!' : 'Click or Drag PDF files here'}</p>
                <p className="dz-sub">Combine two or more documents into one</p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: 20 }}>
               <div className="pdf-list">
                {files.map((f, i) => (
                  <div key={f.id} className="pdf-item">
                    <div className="pdf-icon">📄</div>
                    <div className="pdf-info">
                      <span className="pdf-name" title={f.name}>{f.name}</span>
                      <span className="pdf-meta">{fmtBytes(f.size)}</span>
                    </div>
                    <div className="pdf-actions">
                      <button className="pdf-btn" onClick={() => moveUp(i)} disabled={i === 0}>↑</button>
                      <button className="pdf-btn" onClick={() => moveDown(i)} disabled={i === files.length - 1}>↓</button>
                      <button className="pdf-btn pdf-remove" onClick={() => removeFile(f.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="meta-footer">
                <InfoChips items={[
                  { label: 'Documents', value: files.length },
                  { label: 'Estimated Size', value: fmtBytes(totalSize) }
                ]} />
                <div className="reset-wrap">
                  <ResetBtn onClick={reset} />
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Step 2: Merge & Preview">
          {files.length === 0 ? (
            <div className="tips-list">
              <div className="tip-card">
                <span className="tip-icon">🛡️</span>
                <div>
                  <span className="tip-title">100% Client-Side</span>
                  <span className="tip-text">Merging happens right in your browser. Your sensitive documents never touch our servers.</span>
                </div>
              </div>
              <div className="tip-card">
                <span className="tip-icon">⚡</span>
                <div>
                  <span className="tip-title">Zero Compression Loss</span>
                  <span className="tip-text">We keep the original page high-fidelity quality and formatting exactly as it was.</span>
                </div>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🔄</span>
                <div>
                  <span className="tip-title">Reorder with Ease</span>
                  <span className="tip-text">Drag and drop or use arrow buttons to define the exact sequence of your final PDF.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-stack">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You have selected <strong>{files.length} documents</strong>. Click "Merge & Preview" to generate a preview of the combined document.
              </p>
              
                <Btn onClick={handlePreview} loading={running} disabled={files.length < 2 || running}>
                🔍 Merge & Preview
              </Btn>
              
              <StatusBar status={status} />
              {running && <ProgressBar value={progress} />}
            </div>
          )}
        </Panel>

        <Panel title="Step 3: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {!previewUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Combine size={40} />
                  </div>
                  <p>Combine your documents in Step 2 to see the preview here!</p>
                </div>
             ) : (
                <div className="pdf-preview-wrap-refined">
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Merged PDF Preview"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Merge Successful</span>
                      <span className="pill-subtitle">Document combined correctly</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`merged_${Date.now()}.pdf`} full={false} style={{ padding: '12px 28px' }}>
                Download Combined PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>

      </ToolGrid>

      <AdBanner slot="8888888888" />

      <SEOContent title="Safe & Lightning-Fast PDF Merging Technology">
        <p>Managing multiple PDF documents can be frustrating. Whether you are combining business reports, merging certificates for a job application, or organizing scanned receipts, our <strong>PDF Merge</strong> tool is designed to be the fastest and most secure solution on the web.</p>
        
        <h3>Why Merge PDFs Locally?</h3>
        <p>Traditional online PDF mergers require you to upload your documents to their company servers. This poses a major privacy risk for bank statements, IDs, and internal company memos. Our tool utilizes <strong>WebAssembly and JavaScript</strong> to process every single byte of your data strictly within your browser's memory. No upload means zero risk.</p>
        
        <h3>Pro Features for Productivity</h3>
        <ul>
          <li><strong>No Quantity Limits:</strong> Combine 2 files or 200 files. There are no artificial caps on how many documents you can join.</li>
          <li><strong>Instant Download:</strong> Since there is no upload or server processing lag, the moment the merge is done, the download starts.</li>
          <li><strong>Universal Compatibility:</strong> Results are standardized PDF files that work perfectly in Adobe Acrobat, Chrome, Preview, and all mobile readers.</li>
        </ul>
      </SEOContent>

      <FAQ items={[
        { q: 'Is there a file size limit for merging PDFs?', a: 'You can merge files up to 100MB each. Since the process uses your browser memory, the total size is limited only by your computer\'s available RAM.' },
        { q: 'Will the quality of my PDFs decrease after merging?', a: 'No. Our merger preserves the original byte streams of the pages. Text remains selectable, and images maintain their original resolution.' },
        { q: 'Is it safe to merge confidential documents here?', a: 'Absolutely. We use 100% local processing. No PDF data is ever sent to a server, making this safe for legal, medical, and banking documents.' },
        { q: 'Can I reorder the PDF files before merging?', a: 'Yes! Simply use the up and down arrow buttons next to each file in the list to arrange them in the exact order you want them combined.' }
      ]} />
    </div>
  );
}

export default function PdfMerge() {
  return <ToastProvider><PdfMergeInner /></ToastProvider>;
}
