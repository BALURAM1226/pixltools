import React, { useState, useRef, useCallback, useEffect } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import { Rnd } from 'react-rnd';
import * as pdfjs from 'pdfjs-dist';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { FileText, Edit3, Trash2, Type, UploadCloud, GripHorizontal, PenSquare } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfSign.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfSignInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const sigCanvas = useRef({});
  const dragRef = useRef(null);
  
  // Settings
  const [mode, setMode] = useState('draw'); // 'draw', 'type', 'upload'
  const [pageSelection, setPageSelection] = useState('all'); // last, first, all
  const [color, setColor] = useState('black'); // blue, black, red

  const [typedName, setTypedName] = useState('');
  const [stampFile, setStampFile] = useState(null);
  const [stampPreview, setStampPreview] = useState(null);
  const [sigImageForDrag, setSigImageForDrag] = useState(null);

  const [pdfPagePreview, setPdfPagePreview] = useState(null);
  const [pdfRenderedSize, setPdfRenderedSize] = useState({width: 500, height: 700});
  const [dragPos, setDragPos] = useState({ x: 50, y: 50 });
  const [dragSize, setDragSize] = useState({ width: 220, height: 80 });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const resultRef = useRef(null);

  const onDropPdf = useCallback((accepted) => {
    if (accepted?.length > 0) {
      const selectedFile = accepted[0];
      setFile(selectedFile);
      setPreviewUrl(null);
      setStatus(null);
      setProgress(0);
      setPdfPagePreview(null);
      setCurrentPage(1);
      setPageSelection('current');
    }
  }, []);

  const { getRootProps: getRootPropsPdf, getInputProps: getInputPropsPdf, isDragActive: isDragActivePdf } = useDropzone({
    onDrop: onDropPdf,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  });

  useEffect(() => {
    let active = true;
    const renderPreview = async () => {
      if (!file) return;
      try {
        setStatus({ type: 'processing', msg: `Loading preview for page ${currentPage}...` });
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        if (active) setTotalPages(pdf.numPages);

        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.0 });
        
        const containerWidth = Math.min(window.innerWidth - 80, 500); 
        const renderScale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: renderScale });
        
        if (!active) return;
        setPdfRenderedSize({ width: scaledViewport.width, height: scaledViewport.height });

        const canvas = document.createElement('canvas');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
        if (active) {
            setPdfPagePreview(canvas.toDataURL('image/jpeg', 0.8));
            setStatus(null);
        }
      } catch(e) {
        console.error('Failed to preview pdf', e);
        if (active) setStatus({ type: 'error', msg: 'Failed to generate PDF preview' });
      }
    };
    
    // Slight debounce so quick page clicks don't overwhelm rendering
    const timeoutId = setTimeout(() => {
        if (file) renderPreview();
    }, 150);
    
    return () => { 
        active = false; 
        clearTimeout(timeoutId);
    };
  }, [file, currentPage]);

  const onDropStamp = useCallback((accepted) => {
    if (accepted?.length > 0) {
      const f = accepted[0];
      setStampFile(f);
      const url = URL.createObjectURL(f);
      setStampPreview(url);
    }
  }, []);

  const { getRootProps: getRootPropsStamp, getInputProps: getInputPropsStamp, isDragActive: isDragActiveStamp } = useDropzone({
    onDrop: onDropStamp,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'] },
    multiple: false,
  });

  const clearSignature = () => {
    if (sigCanvas.current && mode === 'draw') {
      sigCanvas.current.clear();
      setSigImageForDrag(null);
    }
    if (mode === 'type') {
      setTypedName('');
    }
    if (mode === 'upload') {
      setStampFile(null);
      setStampPreview(null);
    }
  };

  const updateDrawPreview = () => {
     if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
       setSigImageForDrag(sigCanvas.current.getCanvas().toDataURL('image/png'));
     }
  };

  const getSignatureColor = () => {
    if (color === 'blue') return '#2b6cb0'; 
    if (color === 'red') return '#c53030';
    return '#1a202c'; 
  };

  const hexToRgbScale = (hex) => {
    let _r = 0, _g = 0, _b = 0;
    if (hex === 'blue') { _r = 43/255; _g = 108/255; _b = 176/255; }
    else if (hex === 'red') { _r = 197/255; _g = 48/255; _b = 48/255; }
    else { _r = 26/255; _g = 32/255; _b = 44/255; }
    return rgb(_r, _g, _b);
  };

  const signPdf = async () => {
    if (!file) return;
    
    if (mode === 'draw' && (!sigCanvas.current || sigCanvas.current.isEmpty())) {
      toast('Please draw your signature first.', 'warning');
      return;
    }
    if (mode === 'type' && !typedName.trim()) {
      toast('Please enter your name.', 'warning');
      return;
    }
    if (mode === 'upload' && !stampFile) {
      toast('Please upload a company stamp or signature image.', 'warning');
      return;
    }
    
    setRunning(true);
    setProgress(10);
    setStatus({ type: 'processing', msg: 'Reading signature data...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      let pdfSigImage = null;
      let font = null;

      const visualSigWidth = dragSize.width;
      const visualSigHeight = dragSize.height;

      const pctX = dragPos.x / pdfRenderedSize.width;
      const pctY = dragPos.y / pdfRenderedSize.height;
      const pctW = visualSigWidth / pdfRenderedSize.width;
      const pctH = visualSigHeight / pdfRenderedSize.height;

      // Handle embedded images/fonts
      if (mode === 'draw') {
        const sigDataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
        const b64 = sigDataUrl.split(',')[1];
        const sigImageBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        pdfSigImage = await pdfDoc.embedPng(sigImageBytes);
      } else if (mode === 'upload') {
        const stampBytes = await stampFile.arrayBuffer();
        if (stampFile.type.includes('png')) {
          pdfSigImage = await pdfDoc.embedPng(stampBytes);
        } else {
          pdfSigImage = await pdfDoc.embedJpg(stampBytes);
        }
      } else if (mode === 'type') {
        font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      }

      const pages = pdfDoc.getPages();


      let targetPages = [];
      if (pageSelection === 'last') targetPages = [pages[pages.length - 1]];
      else if (pageSelection === 'first') targetPages = [pages[0]];
      else if (pageSelection === 'current') targetPages = [pages[currentPage - 1]];
      else targetPages = pages; 

      for (let i = 0; i < targetPages.length; i++) {
        const page = targetPages[i];
        const { width, height } = page.getSize();
        
        const sigW = width * pctW;
        const sigH = height * pctH;

        let x = width * pctX;
        let y = height - (height * pctY) - sigH;

        if (mode === 'draw' || mode === 'upload') {
          page.drawImage(pdfSigImage, { x, y, width: sigW, height: sigH });
        } else if (mode === 'type') {
          const tName = typedName || 'Your Name';
          const textW10 = font.widthOfTextAtSize(tName, 10);
          const ratioW = (sigW * 0.95) / textW10;
          const ratioH = (sigH * 0.8) / 10;
          const fSize = Math.min(10 * ratioW, 10 * ratioH);
          
          const finalW = font.widthOfTextAtSize(tName, fSize);

          page.drawText(tName, {
            x: x + (sigW - finalW) / 2,
            y: y + (sigH - fSize) / 2 + (fSize * 0.2), // baseline descent approximation
            size: fSize, 
            font: font,
            color: hexToRgbScale(color)
          });
        }

        setProgress(10 + Math.round(((i + 1) / targetPages.length) * 80));
      }

      setStatus({ type: 'processing', msg: 'Saving signed document...' });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Document signed successfully!' });
      toast('Signature applied!', 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error(err);
      toast('Failed to sign document. PDF may be locked or invalid.', 'error');
      setStatus({ type: 'error', msg: 'Processing failed' });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setStatus(null); setProgress(0);
    setPdfPagePreview(null);
    clearSignature();
  };

  return (
    <div className="pdf-sign-page">
      <SEO 
        title="#1 Sign PDF Online – Add E-Signature to PDF Free"
        description="Sign your PDF documents with professional e-signatures instantly. Draw your signature or upload an image. 100% Secure, legally binding in many jurisdictions, and private."
        keywords="sign pdf online, best pdf signer, add e-signature to pdf, draw signature on pdf, professional pdf signing, electronic signature tool free"
        canonicalPath="/pdf-sign"
        ogImage="/og/pdf-sign.jpg"
      />

      <ToolHeader 
        title="Sign" 
        highlight="PDF" 
        badge="✍️ Professional E-Sign"
        icon={<PenSquare size={24} />}
        desc="Apply your signature to any PDF document securely. Browser-based signing ensures your private documents stay under your control."
      />

      <ToolGrid>
        <Panel 
          title="Step 1: Upload PDF" 
          className={`grid-full ${file ? 'compact' : ''}`}
          headerActions={file && <ResetBtn onClick={reset} size="sm" />}
        >
          <div className="uploader-flex-container">
            <div {...getRootPropsPdf()} className={`dropzone-refined ${isDragActivePdf ? 'active' : ''}`}>
              <input {...getInputPropsPdf()} />
              <div className="dz-content">
                <div className="dz-icon-wrap">
                  <FileText size={file ? 20 : 40} />
                </div>
                <h3>{file ? 'Change PDF File' : 'Drop PDF here or click to upload'}</h3>
                {!file && <p>Select document you need to sign</p>}
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
          <Panel title="Step 2: Provide Signature" className="grid-full numbers-settings-panel">
            <div className="signature-flex-layout">
              
              <div className="mode-tabs">
                <button className={`mode-tab ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}>
                  <Edit3 size={16} /> Draw Sign
                </button>
                <button className={`mode-tab ${mode === 'type' ? 'active' : ''}`} onClick={() => setMode('type')}>
                  <Type size={16} /> Type Name
                </button>
                <button className={`mode-tab ${mode === 'upload' ? 'active' : ''}`} onClick={() => setMode('upload')}>
                  <UploadCloud size={16} /> Company Stamp
                </button>
              </div>

              <div className="draw-area-container">
                <div className="canvas-header">
                  <span className="canvas-title">
                    {mode === 'draw' && <><Edit3 size={16} /> Draw Here</>}
                    {mode === 'type' && <><Type size={16} /> Type Signature</>}
                    {mode === 'upload' && <><UploadCloud size={16} /> Upload Stamp</>}
                  </span>
                  
                  {mode !== 'upload' && (
                    <div className="color-picker-wrap">
                      <button className={`color-swatch black ${color === 'black' ? 'active' : ''}`} onClick={() => setColor('black')} title="Black Ink"></button>
                      <button className={`color-swatch blue ${color === 'blue' ? 'active' : ''}`} onClick={() => setColor('blue')} title="Blue Ink"></button>
                      <button className={`color-swatch red ${color === 'red' ? 'active' : ''}`} onClick={() => setColor('red')} title="Red Ink"></button>
                    </div>
                  )}
                </div>
                
                {mode === 'draw' && (
                  <div className="sig-canvas-wrapper" style={{ borderColor: getSignatureColor() }}>
                    <SignatureCanvas 
                      ref={sigCanvas} 
                      penColor={getSignatureColor()}
                      onEnd={updateDrawPreview}
                      canvasProps={{ className: 'sig-canvas', width: 500, height: 200 }} 
                    />
                    <div className="sig-baseline"></div>
                  </div>
                )}

                {mode === 'type' && (
                  <div className="type-canvas-wrapper">
                    <input 
                      type="text" 
                      className="type-sign-input" 
                      placeholder="Enter your name..."
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      style={{ color: getSignatureColor() }}
                    />
                  </div>
                )}

                {mode === 'upload' && (
                  <div className="upload-canvas-wrapper">
                     {!stampPreview ? (
                       <div {...getRootPropsStamp()} className={`stamp-dropzone ${isDragActiveStamp ? 'active' : ''}`}>
                          <input {...getInputPropsStamp()} />
                          <UploadCloud size={30} />
                          <p>Click or drag image here (PNG/JPG)</p>
                       </div>
                     ) : (
                       <div className="stamp-preview-cont">
                          <img src={stampPreview} alt="Signature Stamp Preview" />
                       </div>
                     )}
                  </div>
                )}

                <div className="canvas-footer">
                  <button className="text-btn clear-btn" onClick={clearSignature}>
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {file && pdfPagePreview && (
          <Panel title="Step 3: Position Signature on Page" className="grid-full position-panel animate-in">
             <div className="placer-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Btn size="sm" variant="secondary" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>&laquo; Prev</Btn>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Page {currentPage} of {totalPages}</span>
                    <Btn size="sm" variant="secondary" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>Next &raquo;</Btn>
                </div>

                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 600 }}>Apply this position to:</label>
                    <select className="modern-input select" value={pageSelection} onChange={(e) => setPageSelection(e.target.value)} style={{ padding: '6px 12px', minWidth: '180px' }}>
                      <option value="current">Only This Page (Page {currentPage})</option>
                      <option value="all">Every Page</option>
                      <option value="first">First Page Only</option>
                      <option value="last">Last Page Only</option>
                    </select>
                </div>
             </div>

             <div className="pdf-placer-wrapper" style={{ display: 'flex', justifyContent: 'center', background: 'var(--bg-elevated)', padding: '30px', borderRadius: '12px', border: '2px dashed var(--border-hover)', overflow: 'hidden' }}>
                <div className="pdf-placer-container" style={{ position: 'relative', width: pdfRenderedSize.width, height: pdfRenderedSize.height, border: '1px solid #a0aec0', background: '#fff', boxShadow: 'var(--shadow-lg)' }}>
                   <img src={pdfPagePreview} alt="PDF preview" style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }} />
                   
                   <Rnd 
                      bounds="parent" 
                      position={{ x: dragPos.x, y: dragPos.y }} 
                      size={{ width: dragSize.width, height: dragSize.height }}
                      onDragStop={(e, d) => setDragPos({x: d.x, y: d.y})}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        setDragSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
                        setDragPos({ x: position.x, y: position.y });
                      }}
                      enableResizing={{
                        top: false, right: true, bottom: true, left: true,
                        topRight: false, bottomRight: true, bottomLeft: true, topLeft: false
                      }}
                      style={{ position: 'absolute', zIndex: 10, padding: '4px', border: '2px dashed var(--accent)', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', touchAction: 'none' }}
                      dragHandleClassName="drag-handle-icon"
                   >
                      <div ref={dragRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div className="drag-handle-icon" style={{ position: 'absolute', top: -14, left: -14, background: 'var(--accent)', color: 'white', borderRadius: '50%', padding: '2px', cursor: 'move' }}><GripHorizontal size={14} /></div>
                          {mode === 'draw' && sigImageForDrag && <img src={sigImageForDrag} style={{ width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' }} alt="sig" />}
                          {mode === 'draw' && !sigImageForDrag && <span style={{fontSize: '12px', padding: '10px', color: '#666', fontWeight: 600}}>Draw signature above...</span>}
                          {mode === 'type' && <div style={{ color: getSignatureColor(), fontStyle: 'italic', fontWeight: 'bold', fontSize: '100%', padding: '0 8px', fontFamily: 'serif', whiteSpace: 'nowrap', pointerEvents: 'none', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 300 100">
                                <text x="150" y="65" textAnchor="middle" fontSize="60" fontStyle="italic" fontWeight="bold" fontFamily="serif" fill={getSignatureColor()}>{typedName || 'Your Name'}</text>
                             </svg>
                          </div>}
                          {mode === 'upload' && stampPreview && <img src={stampPreview} style={{ width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' }} alt="stamp" />}
                          {mode === 'upload' && !stampPreview && <span style={{fontSize: '12px', padding: '10px', color: '#666', fontWeight: 600}}>Upload stamp above...</span>}
                      </div>
                   </Rnd>
                </div>
             </div>
             <p style={{textAlign: 'center', marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px'}}>
               <GripHorizontal size={16} style={{ verticalAlign: 'middle', marginRight: 4 }}/> 
               Drag the signature box above to position it perfectly on the document.
             </p>

             <div className="action-stack-wide" style={{ marginTop: '20px' }}>
                <Btn 
                  variant="primary" 
                  onClick={signPdf} 
                  loading={running} 
                  disabled={running}
                  full={false}
                  className="btn-watermark-final btn-lg"
                >
                   <Edit3 size={18} style={{ marginRight: 8 }} />
                   Apply Signature Permanently
                </Btn>
             </div>
             
             {running && <div className="progress-wrap"><ProgressBar value={progress} /></div>}
             <StatusBar status={status} />
          </Panel>
        )}

        <Panel title="Step 4: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {!previewUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Edit3 size={40} />
                  </div>
                  <p>Provide your signature and position it to see the result.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Signed PDF Preview"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill success-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Sign Complete</span>
                      <span className="pill-subtitle">Locally verified</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`signed_${file.name}`} full={false} style={{ padding: '12px 28px' }}>
                Download Signed PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="0987654388" />

      <SEOContent title="Visually Custom Position Signatures on PDFs">
        <p>A fast, free, and secure way to digitally sign a PDF document. By combining your browser's local computational power with modern canvas interfaces, you can sign NDAs, invoices, or legal documents seamlessly without giving away your private data.</p>

        <h3>Interactive Drag & Drop Positioning</h3>
        <p>Gone are the days of guessing where your signature will land. Our tool renders a high-quality preview of your PDF right in the browser. You can physically grab your drawn signature, typed text, or company seal and precisely drag it to any line or dotted area before applying the permanent stamp.</p>

        <h3>Zero Trust Architecture</h3>
        <p>Other signature solutions upload your extremely confidential contracts to external endpoints where you have zero control. <strong>Sign PDF</strong> executes processing purely in the client's memory. When you reload the page, all sensitive signature paths and documents instantly vanish.</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Are these electronic signatures legally binding?', a: 'In many jurisdictions across the US (ESIGN Act) and globally, a drawn electronic signature is legally binding identical to pen and paper. Check local laws for critical legal paperwork.' },
        { q: 'Can I physically drag and align the signature?', a: 'Yes! Step 3 provides a visual preview of your document. Use your mouse or finger to drag the signature box exactly to the signing line before clicking "Apply".' },
        { q: 'Will my signature upload to your server?', a: 'No, your drawn signature and your document never leave your specific device.' }
      ]} />
    </div>
  );
}

export default function PdfSign() {
  return (
    <ToastProvider>
      <PdfSignInner />
    </ToastProvider>
  );
}
