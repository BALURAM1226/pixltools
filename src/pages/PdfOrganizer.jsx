import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { 
  RotateCw, Trash2, ArrowLeft, ArrowRight, LayoutGrid, 
  FileText, Combine
} from 'lucide-react';
import '../components/ToolShell.css';
import './PdfOrganizer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfOrganizerInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { id, originalIndex, rotation, thumbnail }
  const [previewUrl, setPreviewUrl] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const resultRef = useRef(null);

  const onDrop = useCallback(async (accepted) => {
    if (accepted?.length > 0) {
      const f = accepted[0];
      setRunning(true);
      setStatus({ type: 'processing', msg: 'Analyzing PDF structure...' });
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
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport }).promise;
          const thumbnail = canvas.toDataURL('image/jpeg', 0.6);
          
          loadedPages.push({
            id: `page-${i}-${Date.now()}`,
            originalIndex: i - 1,
            rotation: 0,
            thumbnail
          });
          setProgress(Math.round((i / count) * 100));
        }

        setFile(f);
        setPages(loadedPages);
        toast(`Loaded ${count} pages successfully.`, 'success');
        setStatus(null);
      } catch (err) {
        console.error(err);
        toast('Failed to load PDF. It might be password protected.', 'error');
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

  const rotatePage = (index) => {
    setPages(prev => {
      const next = [...prev];
      next[index] = { ...next[index], rotation: (next[index].rotation + 90) % 360 };
      return next;
    });
    setPreviewUrl(null);
  };

  const removePage = (index) => {
    if (pages.length <= 1) {
      toast('A PDF must have at least one page.', 'warning');
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrl(null);
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    setPages(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setPreviewUrl(null);
  };

  const moveRight = (index) => {
    if (index === pages.length - 1) return;
    setPages(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setPreviewUrl(null);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.parentNode);
    // Slight delay to allow ghost image generation before changing opacity
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setPages(prev => {
      const next = [...prev];
      const draggedItem = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(index, 0, draggedItem);
      return next;
    });
    setDraggedIndex(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setPreviewUrl(null);
  };

  const organizePdf = async () => {
    if (!file || pages.length === 0) return;
    setRunning(true);
    setProgress(0);
    setStatus({ type: 'processing', msg: 'Reorganizing and rotating pages...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const organizedPdf = await PDFDocument.create();
      
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const [copiedPage] = await organizedPdf.copyPages(originalPdf, [p.originalIndex]);
        
        // Apply rotation
        if (p.rotation !== 0) {
          const currentRot = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRot + p.rotation));
        }
        
        organizedPdf.addPage(copiedPage);
        setProgress(Math.round(((i + 1) / pages.length) * 100));
        setStatus({ type: 'processing', msg: `Processing page ${i + 1} of ${pages.length}...` });
      }

      const bytes = await organizedPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      toast('PDF organized successfully!', 'success');
      setStatus({ type: 'success', msg: 'Ready for download.' });
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error(err);
      toast('Failed to organize PDF.', 'error');
      setStatus({ type: 'error', msg: 'Processing failed' });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null); setPages([]); setPreviewUrl(null); setStatus(null); setProgress(0);
  };

  return (
    <div className="pdf-organizer-page">
      <SEO 
        title="Best Organize PDF Online – Rearrange & Rotate PDF Pages Free"
        description="Easily rearrange, delete, or rotate pages in your PDF document visually. Professional browser-based PDF organization with 100% privacy and zero upload risk."
        keywords="organize pdf online, best pdf organizer, rearrange pdf pages free, rotate pdf pages online, separate pdf pages, edit pdf structure"
        canonicalPath="/pdf-organizer"
        ogImage="/og/pdf-organizer.jpg"
      />

      <ToolHeader 
        title="Organize" 
        highlight="PDF" 
        badge="📅 Visual Management"
        icon={<LayoutGrid size={24} />}
        desc="Visual page management. Drag-and-drop ordering, per-page rotation, and extraction. Fast and 100% Secure."
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
                {!file && <p>Select document to start organizing</p>}
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
          <Panel title="Step 2: Arrange & Modify Pages" className="grid-full organizer-panel">
            <div className="organizer-toolbar">
              <div className="toolbar-info">
                <strong>{pages.length} Pages</strong> detected. <strong>Drag cards to rearrange</strong>, or use buttons to modify.
              </div>
              <div className="toolbar-actions">
                <Btn onClick={organizePdf} loading={running} disabled={running} full={false} className="btn-organize-final">
                   🚀 Apply Changes & Generate
                </Btn>
                <ResetBtn onClick={reset} />
              </div>
            </div>

            {running && <ProgressBar value={progress} />}
            <StatusBar status={status} />

            <div className="pages-grid">
              {pages.map((p, idx) => (
                <div 
                  key={p.id} 
                  className={`page-organizer-card animate-in ${draggedIndex === idx ? 'dragging' : ''}`} 
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                >
                  <div className="card-header cursor-grab">
                    <span className="page-index">Page {idx + 1}</span>
                    <div className="card-controls">
                      <button onClick={() => moveLeft(idx)} disabled={idx === 0} title="Move Left"><ArrowLeft size={14} /></button>
                      <button onClick={() => moveRight(idx)} disabled={idx === pages.length - 1} title="Move Right"><ArrowRight size={14} /></button>
                    </div>
                  </div>
                  
                  <div className="page-thumbnail-container" style={{ transform: `rotate(${p.rotation}deg)` }}>
                    <img src={p.thumbnail} alt={`Page ${idx + 1}`} draggable="false" />
                  </div>

                  <div className="card-footer">
                    <button className="tool-btn rotate" onClick={() => rotatePage(idx)} title="Rotate Page">
                      <RotateCw size={14} />
                    </button>
                    <button className="tool-btn delete" onClick={() => removePage(idx)} title="Remove Page">
                      <Trash2 size={14} />
                    </button>
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
                    <Combine size={40} />
                  </div>
                  <p>Organize your pages in Step 2 to generate the preview.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Organized PDF Preview"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">PDF Organized</span>
                      <span className="pill-subtitle">Ready for immediate download</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`organized_${Date.now()}.pdf`} full={false} style={{ padding: '12px 28px' }}>
                Download Result PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="1234567890" />

      <SEOContent title="Organize PDF Pages Online with Privacy in Mind">
        <p>Rearranging pages in a PDF shouldn't require expensive Pro software. Whether you need to fix a document scanned out of order, remove unnecessary pages from a report, or rotate incorrectly oriented scans, our <strong>PDF Organizer</strong> is built for speed and privacy.</p>

        <h3>Why iLoveToolHub for PDF Organization?</h3>
        <p>Most online tools require you to upload your sensitive files to their cloud servers. We believe your data should stay yours. Our organizer runs entirely in your <strong>browser session</strong>. No page you view or document you create ever leaves your device.</p>

        <h3>Powerful Visual Controls</h3>
        <ul>
          <li><strong>Drag-and-Drop Logic:</strong> Intuitively move pages to their correct locations with single-click precision.</li>
          <li><strong>Per-Page Rotation:</strong> Fix landscape pages that were scanned vertically without affecting the rest of the file.</li>
          <li><strong>Page Extraction:</strong> Easily delete pages to extract only the information you need.</li>
          <li><strong>Zero Quality Loss:</strong> We preserve the original vector data and image quality of your document.</li>
        </ul>
      </SEOContent>

      <FAQ items={[
        { q: 'Is it safe to organize bank statements or IDs here?', a: 'Completely. Because the processing happens locally in your browser using JavaScript and WebAssembly, your sensitive documents are never sent across the internet.' },
        { q: 'Can I rotate individual pages?', a: 'Yes. Every page has a dedicated rotate button so you can fix one page without rotating the entire document.' },
        { q: 'Is there a limit on the number of pages?', a: 'The tool can handle very large PDFs, but since it generates thumbnails for browsing, it depends on your device\'s RAM. We recommend documents up to 200 pages for the best experience.' },
        { q: 'How do I save the changes?', a: 'Once you are happy with the arrangement, click "Apply Changes & Generate" in Step 2, and a download button will appear at the bottom.' }
      ]} />
    </div>
  );
}

export default function PdfOrganizer() {
  return (
    <ToastProvider>
      <PdfOrganizerInner />
    </ToastProvider>
  );
}
