import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { 
  Trash2, FileX, Scissors, FileText, Circle
} from 'lucide-react';
import '../components/ToolShell.css';
import './PdfRemovePages.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfRemovePagesInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { id, originalIndex, thumbnail, selected }
  const [previewUrl, setPreviewUrl] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const resultRef = useRef(null);

  const onDrop = useCallback(async (accepted) => {
    if (accepted?.length > 0) {
      const f = accepted[0];
      setRunning(true);
      setStatus({ type: 'processing', msg: 'Analyzing PDF pages...' });
      setPages([]);
      setPreviewUrl(null);
      
      try {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        const count = pdf.numPages;
        
        const loadedPages = [];
        for (let i = 1; i <= count; i++) {
          setStatus({ type: 'processing', msg: `Loading page ${i} of ${count}...` });
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport }).promise;
          const thumbnail = canvas.toDataURL('image/jpeg', 0.6);
          
          loadedPages.push({
            id: `rm-page-${i}-${Date.now()}`,
            originalIndex: i - 1,
            thumbnail,
            selected: false // "selected" here means "tagged for removal"
          });
          setProgress(Math.round((i / count) * 100));
        }

        setFile(f);
        setPages(loadedPages);
        toast(`PDF Loaded: ${count} pages detected. Select pages to discard.`, 'success');
        setStatus(null);
      } catch (err) {
        console.error(err);
        toast('Failed to load PDF.', 'error');
        setStatus({ type: 'error', msg: 'Load failed' });
      } finally {
        setRunning(false);
        setProgress(0);
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  });

  const togglePageSelection = (idx) => {
    setPages(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], selected: !next[idx].selected };
      return next;
    });
    setPreviewUrl(null);
  };

  const selectedCount = pages.filter(p => p.selected).length;

  const removeSelectedPages = async () => {
    if (!file || pages.length === 0) return;
    if (selectedCount === 0) {
      toast('Please select at least one page to remove.', 'warning');
      return;
    }
    if (selectedCount === pages.length) {
      toast('You cannot remove all pages from a PDF.', 'error');
      return;
    }

    setRunning(true);
    setProgress(0);
    setStatus({ type: 'processing', msg: 'Removing selected pages...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const pagesToKeep = pages.filter(p => !p.selected);
      
      for (let i = 0; i < pagesToKeep.length; i++) {
        const p = pagesToKeep[i];
        const [copiedPage] = await newPdf.copyPages(originalPdf, [p.originalIndex]);
        newPdf.addPage(copiedPage);
        
        setProgress(Math.round(((i + 1) / pagesToKeep.length) * 100));
        setStatus({ type: 'processing', msg: `Saving page ${i + 1} of ${pagesToKeep.length}...` });
      }

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      toast('Pages removed successfully!', 'success');
      setStatus({ type: 'success', msg: `✓ Processed! ${selectedCount} pages removed.` });
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error(err);
      toast('Processing failed.', 'error');
      setStatus({ type: 'error', msg: 'Error' });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null); setPages([]); setPreviewUrl(null); setStatus(null); setProgress(0);
  };

  return (
    <div className="pdf-remove-page">
      <SEO 
        title="Best Remove PDF Pages Online – Delete Specific PDF Pages Free"
        description="Quickly delete unwanted pages from your PDF document visually. Select pages to discard and generate a cleaned PDF instantly. 100% Private, local, and secure."
        keywords="remove pdf pages, best pdf page remover, delete specific pdf pages free, cut pdf pages online, separate pdf pages, cleaned pdf maker"
        canonicalPath="/pdf-remove-pages"
        ogImage="/og/pdf-remove-pages.jpg"
      />

      <ToolHeader 
        title="Remove" 
        highlight="PDF Pages" 
        badge="✂️ Clean & Discard"
        icon={<FileX size={24} />}
        desc="Delete specific pages from your PDF. Simple visual selection with high-speed local rendering for maximum security."
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
                {!file && <p>Select document to start removal</p>}
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

        {pages.length > 0 && (
          <Panel title="Step 2: Select Pages to Remove" className="grid-full selection-panel">
            <div className="selection-toolbar">
              <div className="toolbar-stats">
                 <span>Total: <strong>{pages.length}</strong></span>
                 <span>To Remove: <strong className="remove-count">{selectedCount}</strong></span>
              </div>
              <div className="toolbar-actions">
                <Btn 
                  variant="danger" 
                  onClick={removeSelectedPages} 
                  loading={running} 
                  disabled={running || selectedCount === 0}
                  className="btn-remove-final"
                  full={false}
                >
                   <Trash2 size={18} style={{ marginRight: 8 }} />
                   Remove Selected Pages
                </Btn>
                <ResetBtn onClick={reset} />
              </div>
            </div>

            {running && <ProgressBar value={progress} />}
            <StatusBar status={status} />

            <div className="remove-pages-grid">
              {pages.map((p, idx) => (
                <div 
                  key={p.id} 
                  className={`remove-card animate-in ${p.selected ? 'tagged-for-removal' : ''}`}
                  onClick={() => togglePageSelection(idx)}
                >
                  <div className="remove-badge">
                    {p.selected ? <FileX size={16} /> : <Circle size={16} />}
                  </div>
                  
                  <div className="remove-thumbnail">
                    <img src={p.thumbnail} alt={`Page ${idx + 1}`} />
                    {p.selected && <div className="removal-overlay"><Trash2 size={32} /></div>}
                  </div>

                  <div className="remove-info">
                    <span>PAGE {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <Panel title="Step 3: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {!previewUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Scissors size={40} />
                  </div>
                  <p>Select pages to remove in Step 2 to generate the new PDF.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Resulting PDF"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Process Complete</span>
                      <span className="pill-subtitle">New PDF document generated</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`cleaned_${file.name}`} full={false} style={{ padding: '12px 28px' }}>
                Download New PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="1212121212" />

      <SEOContent title="How to Remove Pages from PDF for Free">
        <p>Our <strong>PDF Page Remover</strong> is designed for one thing: getting rid of the clutter in your documents efficiently. Whether it is an empty page at the end of a report or sensitive information in a legal document, we make it easy to selectively delete pages.</p>

        <h3>Fast Visual Selection</h3>
        <p>Instead of typing page ranges, simply scroll through your document in our visual grid. Click any page to tag it for removal. It's the most intuitive way to ensure you are deleting exactly what you intended.</p>

        <h3>Strict Privacy Standards</h3>
        <ul>
          <li><strong>No Uploads:</strong> Your document is processed in real-time within your browser. The "upload" is simply a local file read.</li>
          <li><strong>End-to-End Encryption:</strong> Since no data ever leaves your computer, your files remain 100% private and secure from third-party interception.</li>
          <li><strong>Full Quality:</strong> We don't re-compress your document's contents. We simply restructure the PDF to exclude the pages you don't want.</li>
        </ul>
      </SEOContent>

      <FAQ items={[
        { q: 'Is there a limit on how many pages I can remove?', a: 'No. You can remove as many pages as you want, as long as you leave at least one page in the document.' },
        { q: 'Can I undo the removal?', a: 'If you tag a page for removal, you can click it again to un-tag it before processing. If you have already generated the new PDF, simply reset and start over—your original file remains untouched.' },
        { q: 'Does this work on mobile?', a: 'Yes, the interface is fully responsive. However, for very large PDF files, we recommend using a desktop for better performance during thumbnail generation.' }
      ]} />
    </div>
  );
}

export default function PdfRemovePages() {
  return (
    <ToastProvider>
      <PdfRemovePagesInner />
    </ToastProvider>
  );
}
