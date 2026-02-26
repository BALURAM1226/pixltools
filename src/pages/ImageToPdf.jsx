import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import jsPDF from 'jspdf';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Control, Select, Slider, Btn,
  ResetBtn, StatusBar, ProgressBar, InfoChips, PreviewBox, AdBanner, FAQ, SEOContent,
} from '../components/ToolShell';
import '../components/ToolShell.css';
import './ImageToPdf.css';

const PAGE_SIZES = [
  { label: 'A4   — 210×297 mm', w: 210, h: 297 },
  { label: 'A5   — 148×210 mm', w: 148, h: 210 },
  { label: 'A3   — 297×420 mm', w: 297, h: 420 },
  { label: 'Letter — 215×279 mm', w: 215.9, h: 279.4 },
  { label: 'Legal  — 215×356 mm', w: 215.9, h: 355.6 },
  { label: 'Auto   — fit image', w: null, h: null },
];

function fmtBytes(b) {
  if (!b) return '';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function ImageToPdfInner() {
  const toast = useToast();

  const [images, setImages] = useState([]);
  const [pageSizeKey, setPageSizeKey] = useState('0');    // string index
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState(10);
  const [quality, setQuality] = useState(88);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const resultRef = useRef(null);

  /* ── dropzone ─────────────────────────────────────────── */
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length > 0) {
      const code = rejected[0].errors[0]?.code;
      toast(
        code === 'file-too-large' ? 'One or more files exceed 50 MB.'
          : code === 'file-invalid-type' ? 'Only image files are accepted.'
            : 'Some files could not be added.',
        'error'
      );
    }
    if (accepted?.length > 0) {
      const newImgs = accepted.map(f => ({
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }));
      setImages(prev => [...prev, ...newImgs]);
      toast(`${newImgs.length} image${newImgs.length > 1 ? 's' : ''} added`, 'success');
      setStatus(null);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  const removeImg = i => setImages(prev => {
    URL.revokeObjectURL(prev[i].url);
    return prev.filter((_, idx) => idx !== i);
  });
  const moveUp = i => { if (i === 0) return; setImages(a => { const b = [...a];[b[i - 1], b[i]] = [b[i], b[i - 1]]; return b; }); };
  const moveDown = i => { if (i === images.length - 1) return; setImages(a => { const b = [...a];[b[i], b[i + 1]] = [b[i + 1], b[i]]; return b; }); };

  /* ── convert ──────────────────────────────────────────── */
  const convert = async () => {
    if (images.length === 0) { toast('Please add at least one image.', 'warning'); return; }
    if (running) return;

    setRunning(true);
    setProgress(3);
    setStatus({ type: 'processing', msg: `Creating PDF from ${images.length} page${images.length > 1 ? 's' : ''}…` });

    try {
      const psIdx = Number(pageSizeKey);
      const ps = PAGE_SIZES[psIdx];
      const isAuto = ps.w === null;

      const loadImg = url => new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });

      const firstImg = await loadImg(images[0].url);
      setProgress(10);

      /* Determine page size */
      let pageW, pageH;
      if (isAuto) {
        pageW = firstImg.naturalWidth * 0.264583;   // px → mm
        pageH = firstImg.naturalHeight * 0.264583;
      } else {
        pageW = orientation === 'landscape' ? ps.h : ps.w;
        pageH = orientation === 'landscape' ? ps.w : ps.h;
      }

      const pdf = new jsPDF({
        orientation: isAuto ? 'portrait' : orientation,
        unit: 'mm',
        format: isAuto ? [pageW, pageH] : [pageW, pageH],
      });

      const docW = pdf.internal.pageSize.getWidth();
      const docH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < images.length; i++) {
        setProgress(10 + Math.round((i / images.length) * 82));
        setStatus({ type: 'processing', msg: `Processing page ${i + 1} of ${images.length}…` });

        if (i > 0) pdf.addPage();

        const img = await loadImg(images[i].url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);

        const m = Math.max(0, margin);
        const maxW = docW - m * 2;
        const maxH = docH - m * 2;
        const imgWmm = img.naturalWidth * 0.264583;
        const imgHmm = img.naturalHeight * 0.264583;
        const ratio = Math.min(maxW / imgWmm, maxH / imgHmm, 1); // don't upscale
        const w = imgWmm * ratio;
        const h = imgHmm * ratio;
        const x = m + (maxW - w) / 2;
        const y = m + (maxH - h) / 2;

        pdf.addImage(dataUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
      }

      setProgress(97);
      pdf.save(`ilovetoolhub-pdf-${Date.now()}.pdf`);
      setProgress(100);
      setStatus({ type: 'success', msg: `✓ PDF with ${images.length} page${images.length > 1 ? 's' : ''} downloaded!` });
      toast('PDF created and downloaded!', 'success');

      // Auto-scroll to preview
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err) {
      setStatus({ type: 'error', msg: `✗ ${err.message}` });
      toast(err.message, 'error');
      setProgress(0);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]); setStatus(null); setProgress(0); setRunning(false);
  };

  const totalBytes = images.reduce((a, i) => a + i.size, 0);
  const psIdx = Number(pageSizeKey);
  const isAuto = PAGE_SIZES[psIdx].w === null;

  return (
    <>
      <SEO
        title="Combine Images to PDF Online – Fast, Free & Private"
        description="Convert JPG, PNG, and WebP images to high-quality PDF. Merge multiple pages, reorder them, and choose page sizes for all official and professional documents globally."
        keywords="image to pdf converter, combine jpg to pdf, merge png to pdf, photo to pdf maker, official document pdf builder, free online pdf tool"
        canonicalPath="/image-to-pdf"
      />

      <ToolHeader
        title="Image to"
        highlight="PDF"
        badge="📄 Multi-Page"
        desc="Combine multiple images into a single professional PDF. Drag to reorder pages and fully customise layout."
      />

      <ToolGrid>
        {/* ── Top Left: Add Images ── */}
        <Panel title="Step 1: Add Images">
          {/* Drop zone */}
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dz-active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dz-inner">
              <div className="dz-icon-wrap">
                <svg className="dz-icon" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="dz-text">
                <p className="dz-label">{isDragActive ? 'Drop images!' : 'Click to add images'}</p>
                <p className="dz-sub">Combine multiple JPG, PNG, WEBP into one PDF</p>
              </div>
            </div>
          </div>

          {/* Image list */}
          {images.length > 0 && (
            <div className="preview-stack" style={{ marginTop: 16 }}>
              <div className="pdf-img-list">
                {images.map((img, i) => (
                  <div key={img.url} className="pdf-img-item">
                    <img src={img.url} alt={img.name} className="pdf-thumb" />
                    <div className="pdf-img-meta">
                      <span className="pdf-page-num">p{i + 1}</span>
                      <span className="pdf-img-name" title={img.name}>{img.name}</span>
                    </div>
                    <div className="pdf-img-ctrls">
                      <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="pdf-ctrl">↑</button>
                      <button type="button" onClick={() => moveDown(i)} disabled={i === images.length - 1} className="pdf-ctrl">↓</button>
                      <button type="button" onClick={() => removeImg(i)} className="pdf-ctrl pdf-remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <InfoChips items={[
                { label: 'Total Pages', value: images.length },
                { label: 'Total Size', value: fmtBytes(totalBytes) },
              ]} />
              <ResetBtn onClick={reset} />
            </div>
          )}
        </Panel>

        {/* ── Top Right: Settings or Features ── */}
        {images.length === 0 ? (
          <Panel title="PDF Features">
            <div className="tips-panel">
              <div className="tip-item">
                <span className="tip-icon">📄</span>
                <div>
                  <strong>Multi-Page PDF:</strong> Combine dozens of images into a single, high-quality document.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">📐</span>
                <div>
                  <strong>Custom Layout:</strong> Supports A4, Letter, and Auto-fit for perfect printing.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⚡</span>
                <div>
                  <strong>Fast Processing:</strong> Works entirely in your browser. No server uploads required.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔄</span>
                <div>
                  <strong>Easy Ordering:</strong> Drag and drop or use arrows to refine your page order.
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Step 2: PDF Settings">
            <div className="settings-scroll">
              <Control label="Page Size">
                <Select
                  value={pageSizeKey}
                  onChange={setPageSizeKey}
                  options={PAGE_SIZES.map((s, i) => ({ value: String(i), label: s.label }))}
                />
              </Control>

              <div className="settings-row">
                {!isAuto && (
                  <Control label="Orientation">
                    <Select value={orientation} onChange={setOrientation} options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} />
                  </Control>
                )}

                <Control label="Margin" hint={`${Math.round(margin)} mm`}>
                  <Slider min={0} max={40} step={1} value={margin} onChange={v => setMargin(Math.round(v))} formatValue={v => `${Math.round(v)} mm`} />
                </Control>
              </div>

              <Control label="Image Quality" hint={`${quality}%`}>
                <Slider min={30} max={100} step={1} value={quality} onChange={v => setQuality(Math.round(v))} formatValue={v => `${Math.round(v)}%`} />
              </Control>

              <Btn onClick={convert} loading={running} disabled={images.length === 0 || running}>
                📄 Create & Download PDF
              </Btn>
              <StatusBar status={status} />
              {running && <ProgressBar value={progress} />}
            </div>
          </Panel>
        )}

        {/* ── Bottom: Preview ── */}
        <Panel title="Step 3: Page Preview" className="grid-full result-panel">
          <div ref={resultRef} />
          <PreviewBox minHeight={300} label="Add images to see a preview of your PDF pages">
            {images.length > 0 && (
              <div className="pdf-preview-grid">
                {images.map((img, i) => (
                  <div key={img.url} className="pdf-preview-page">
                    <img src={img.url} alt={`Page ${i + 1}`} className="result-img" />
                    <span className="pdf-page-label">Page {i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </PreviewBox>
        </Panel>
      </ToolGrid>

      <AdBanner slot="7777777777" />

      <SEOContent title="Professional Image to PDF Converter for Global Standards">
        <p>Whether you need to merge multiple images into a single professional document or convert a high-quality scan to a PDF, iLoveToolHub provides the fastest and most private way to do it. No file is ever uploaded to our servers—the entire conversion happens locally on your device.</p>

        <h3>Merge Certificates, Reports, and Scans</h3>
        <p>Users often need to combine multiple document photos or scans into a single PDF for <strong>university admissions, professional portals, or legal applications</strong>. Our tool is designed specifically for this, allowing you to reorder images and choose standard page sizes like A4, Letter, or Fit to Image.</p>

        <h3>Key Features of Our PDF Builder</h3>
        <ul>
          <li><strong>Universal Format Support:</strong> Seamlessly convert JPEG, PNG, and WebP images to high-fidelity PDF.</li>
          <li><strong>Complete Layout Control:</strong> Set orientation to Portrait or Landscape and adjust margins for a clean finish.</li>
          <li><strong>No File Size Limits:</strong> Since it's browser-based, you can merge as many pages as your CPU can handle.</li>
          <li><strong>100% Secure & Private:</strong> Your sensitive documents stay exactly where they belong—with you.</li>
        </ul>

        <h3>How to Convert Images to PDF Online Free</h3>
        <p>1. Drag and drop your images into the upload area above.<br/>2. Reorder the pages by dragging them into your preferred sequence.<br/>3. Select your desired page layout, orientation, and margins.<br/>4. Click "Combine into PDF" and download your result instantly.</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Is this JPG to PDF converter free for all?', a: 'Yes. iLoveToolHub provides a 100% free JPG to PDF service. There are no limits on the number of pages or file size for your PDF documents.' },
        { q: 'Can I use this for document upload in admissions?', a: 'Definitely. Most admission portals require a single PDF. You can upload all your certificates as images and our tool will merge them into a high-quality PDF ready for upload.' },
        { q: 'What is Auto page size?', a: 'Auto creates a PDF page that exactly matches each images dimensions. Useful when you want no cropping or scaling.' },
        { q: 'What does the Quality slider do?', a: 'It controls JPEG compression when embedding images. Lower values create smaller PDF files but with more compression artefacts.' },
      ]} />
    </>
  );
}

export default function ImageToPdf() {
  return <ToastProvider><ImageToPdfInner /></ToastProvider>;
}
