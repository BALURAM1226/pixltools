import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn, Control, InfoChips
} from '../components/ToolShell';
import { Scissors } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfSplitter.css';

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfSplitterInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState('range'); // 'range' or 'all'
  const [rangeStr, setRangeStr] = useState('');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const resultRef = useRef(null);

  const onDrop = useCallback(async (accepted) => {
    if (accepted?.length > 0) {
      const f = accepted[0];
      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPages().length;
        
        setFile(f);
        setPageCount(count);
        setRangeStr(`1-${count}`);
        toast(`PDF loaded: ${count} pages detected.`, 'success');
        setStatus(null);
        setPreviewUrl(null);
      } catch (err) {
        toast('Failed to read PDF. It might be corrupt or encrypted.', 'error');
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  });

  const parseRange = (str, max) => {
    const pages = new Set();
    const parts = str.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
            pages.add(i - 1);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num >= 1 && num <= max) {
          pages.add(num - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const generateSplitPreview = async () => {
    if (!file) return;
    setRunning(true);
    setProgress(10);
    setStatus({ type: 'processing', msg: 'Reading document...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      
      if (splitMode === 'range') {
        const pageIndices = parseRange(rangeStr, pageCount);
        if (pageIndices.length === 0) {
          throw new Error('Please enter a valid page range (e.g., 1-5 or 1,3,5).');
        }

        setStatus({ type: 'processing', msg: `Extracting ${pageIndices.length} pages...` });
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach(p => newPdf.addPage(p));
        
        setProgress(90);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        setProgress(100);
        setStatus({ type: 'success', msg: '✓ Preview generated! Scroll down to see result.' });
        toast('PDF extracted successfully!', 'success');
        
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        // Mode 'all' - ZIP extraction
        setStatus({ type: 'processing', msg: `Splitting into ${pageCount} files and zipping...` });
        const zip = new JSZip();
        
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          zip.file(`page-${i + 1}.pdf`, pdfBytes);
          setProgress(10 + Math.round((i / pageCount) * 80));
        }
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url); // Note: iframe preview for ZIP won't show anything useful, but we use it as existence check
        
        setProgress(100);
        setStatus({ type: 'success', msg: '✓ PDF split into individual pages and zipped! Scroll down to download.' });
        toast('PDF split into ZIP successfully!', 'success');
        
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
      toast(err.message, 'error');
    } finally {
      setRunning(false);
    }
  };



  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null); setPageCount(0); setRangeStr(''); setStatus(null); setProgress(0); setPreviewUrl(null);
  };

  return (
    <div className="pdf-splitter-page">
      <SEO
        title="Best PDF Splitter Online – Extract & Separate PDF Pages Free"
        description="Instantly split PDF files into separate documents or extract exact page ranges. Secure, 100% private browser-side PDF splitter with no data uploads. Best for privacy and speed."
        keywords="split pdf online, best pdf splitter, extract pages from pdf free, separate pdf pages, cut pdf pages online, pdf page extractor tool"
        canonicalPath="/pdf-splitter"
        ogImage="/og/pdf-splitter.jpg"
      />

      <ToolHeader
        title="Split"
        highlight="PDF"
        badge="✂️ Precise & Secure"
        desc="Divide your PDF into smaller parts or extract exactly the pages you need. Fast, secure, and no files ever leave your device."
      />

      <ToolGrid>
        <Panel title="Step 1: Upload PDF">
          {!file ? (
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dz-active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dz-inner">
                <div className="dz-icon-wrap">
                  <svg className="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="dz-text">
                  <p className="dz-label">Click or Drag PDF file here</p>
                  <p className="dz-sub">Max file size: 100MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="file-info-box">
              <div className="pdf-item">
                <div className="pdf-icon">📄</div>
                <div className="pdf-info">
                  <span className="pdf-name">{file.name}</span>
                  <span className="pdf-meta">{pageCount} Pages • {fmtBytes(file.size)}</span>
                </div>
              </div>
              
              <div className="meta-footer">
                <InfoChips items={[
                  { label: 'Page Count', value: pageCount },
                  { label: 'File Size', value: fmtBytes(file.size) }
                ]} />
                <div className="reset-wrap">
                  <ResetBtn onClick={reset} />
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Step 2: Split Settings">
          {!file ? (
            <div className="tips-list">
              <div className="tip-card">
                <span className="tip-icon">🎯</span>
                <div>
                  <span className="tip-title">Precise Extraction</span>
                  <span className="tip-text">Specify exact page ranges like "1-5" or separate pages like "1, 4, 8" to get only what you need.</span>
                </div>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🛡️</span>
                <div>
                  <span className="tip-title">Safe & Confidential</span>
                  <span className="tip-text">Your documents are processed in your browser memory. We never see your content.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="split-options settings-stack">
              <Control label="Selection Mode">
                <div className="mode-selector">
                  <div 
                    className={`mode-card ${splitMode === 'range' ? 'active' : ''}`}
                    onClick={() => { setSplitMode('range'); setPreviewUrl(null); }}
                  >
                    <span className="mode-icon">📑</span>
                    <span className="mode-label">Extract Range</span>
                  </div>
                  <div 
                    className={`mode-card ${splitMode === 'all' ? 'active' : ''}`}
                    onClick={() => { setSplitMode('all'); setPreviewUrl(null); }}
                  >
                    <span className="mode-icon">📦</span>
                    <span className="mode-label">Split Every Page</span>
                  </div>
                </div>
              </Control>

              {splitMode === 'range' && (
                <Control label="Enter Page Range" hint={`Example: 1-3, 5, 8-${pageCount}`}>
                  <div className="range-input-wrap">
                    <input 
                      type="text" 
                      className="range-input"
                      value={rangeStr}
                      onChange={e => { setRangeStr(e.target.value); setPreviewUrl(null); }}
                      placeholder="e.g. 1-5"
                    />
                    <span className="range-hint">Use dashes for ranges and commas for individual pages.</span>
                  </div>
                </Control>
              )}

              <div className="extract-info">
                {splitMode === 'range' ? (
                  <>The tool will create a <strong>new single PDF</strong> containing only the pages you specified above slice.</>
                ) : (
                  <>The tool will split the document into <strong>{pageCount} separate PDFs</strong> and bundle them into a ZIP file.</>
                )}
              </div>

              <div className="action-stack">
                <Btn onClick={generateSplitPreview} loading={running} disabled={!file || running}>
                  {splitMode === 'range' ? '🔍 Extract & Preview' : '📦 Split & Download ZIP'}
                </Btn>
                <StatusBar status={status} />
                {running && <ProgressBar value={progress} />}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Step 3: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
            {!previewUrl ? (
              <div className="result-placeholder">
                <div className="placeholder-icon">
                  <Scissors size={40} />
                </div>
                <p>Configure split settings and click "Split PDF" to see results.</p>
              </div>
            ) : splitMode === 'range' ? (
              <div style={{ padding: '0 32px' }}>
                <iframe 
                  src={`${previewUrl}#view=FitH&toolbar=0`} 
                  className="pdf-preview-frame-modern"
                  title="Extracted PDF Preview"
                />
              </div>
            ) : (
              <div className="zip-ready-hero animate-in">
                <div className="zip-icon-anim">📦</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>ZIP Archive Ready</h3>
                <p style={{ color: 'var(--text-muted)' }}>We've processed {pageCount} individual pages into a single ZIP file.</p>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Split Complete</span>
                      <span className="pill-subtitle">
                        {splitMode === 'range' ? 'Pages extracted successfully' : 'ZIP package generated'}
                      </span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={splitMode === 'range' ? `extracted_${Date.now()}.pdf` : `split_${Date.now()}.zip`} full={false} style={{ padding: '12px 28px' }}>
                {splitMode === 'range' ? 'Download Extracted PDF' : 'Download ZIP File'}
              </DownloadBtn>
            </div>
          )}
        </Panel>

      </ToolGrid>

       <AdBanner slot="9999999999" />

      <SEOContent title="Professional PDF Splitter: Extract Pages with Zero Quality Loss">
        <p>There are many reasons why you might need to <strong>split a PDF</strong>. Maybe you have a massive eBook but only need one chapter for a presentation, or perhaps you have a combined file of your tax returns and only want to send a specific document. Our PDF Splitter is built for these exact moments.</p>

        <h3>No Quality Loss, Just Precision</h3>
        <p>Unlike some tools that "print" your PDF to extract pages (which ruins hyperlinks and reduces text clarity), iLoveToolHub uses <strong>native stream copying</strong>. This means we surgically remove the byte segments for the pages you want and place them in a new file. Your text remains searchable, and your high-resolution images stay crisp.</p>

        <h3>Why Choose Our Private PDF Splitter?</h3>
        <ul>
          <li><strong>Extract Multiple Ranges:</strong> You are not limited to one range. You can extract pages "1-2, 5-10, 15" all into a single new document in one go.</li>
          <li><strong>Split All Pages:</strong> Instantly separate every page of a document into its own individual PDF file, bundled in a ZIP for easy management.</li>
          <li><strong>Total Privacy:</strong> Financial statements, medical records, and legal contracts are safe. They never leave your RAM.</li>
          <li><strong>Fast & Light:</strong> Built with modern WebAssembly-ready logic, even large 50MB PDFs split in seconds.</li>
        </ul>

        <h3>How to Split PDF Online Free</h3>
        <p>1. Upload your PDF file by dragging it into the box above.<br />2. Enter the page numbers you want to keep (e.g., 1-5 or 10, 12, 14-20).<br />3. Click the "Split & Download" button.<br />4. Your new, smaller PDF is ready instantly!</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Is it safe to split confidential PDFs here?', a: 'Yes. Every byte of the splitting process happens locally on your computer. Your document is never uploaded to any external server.' },
        { q: 'Can I extract non-consecutive pages?', a: 'Absolutely. You can enter something like "1, 3, 5-10" to get exactly those pages in your new PDF.' },
        { q: 'Does splitting a PDF reduce its quality?', a: 'Not at all. Our tool extracts the original data streams for those pages, so the internal quality, fonts, and images remain identical to the original.' },
        { q: 'What is the maximum file size I can split?', a: 'Our tool handles PDFs up to 100MB easily. For extremely large files, the performance depends on your device\'s available memory (RAM).' }
      ]} />
    </div>
  );
}

export default function PdfSplitter() {
  return <ToastProvider><PdfSplitterInner /></ToastProvider>;
}
