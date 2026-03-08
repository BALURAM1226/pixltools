import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import DropZone from '../components/DropZone';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Control, Select, Slider, Btn,
  DownloadBtn, ResetBtn, StatusBar, ProgressBar, PreviewBox,
  InfoChips, AdBanner, FAQ, TargetSizeControl
} from '../components/ToolShell';
import imageCompression from 'browser-image-compression';
import '../components/ToolShell.css';
import './ImageConverter.css';

/* ─── constants ─────────────────────────────────────────── */
const FORMATS = [
  { value: 'image/jpeg', label: 'JPG  — JPEG (best compatibility)', ext: 'jpg' },
  { value: 'image/png', label: 'PNG  — Lossless / transparent', ext: 'png' },
  { value: 'image/webp', label: 'WebP — Modern web format', ext: 'webp' },
  { value: 'image/gif', label: 'GIF  — Animated / simple graphics', ext: 'gif' },
  { value: 'image/bmp', label: 'BMP  — Bitmap (uncompressed)', ext: 'bmp' },
  { value: 'image/ico', label: 'ICO  — Icon / favicon', ext: 'ico' },
  { value: 'image/avif', label: 'AVIF — Next-gen (may vary by browser)', ext: 'avif' },
];

const ICO_SIZES = [16, 32, 48, 64, 128, 256];
const MAX_OUT_DIM = 8000;

const EXT_TO_MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
  tiff: 'image/tiff', tif: 'image/tiff', svg: 'image/svg+xml',
  ico: 'image/x-icon', avif: 'image/avif',
};

function fmtBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

/* Load image from data-URL — handles SVG specially */
function loadImageFromDataUrl(dataUrl, mimeHint) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image. Try a different file.'));

    // SVGs need explicit dimensions — set a big viewport so they render
    if (mimeHint === 'image/svg+xml') {
      const blob = dataUrlToBlob(dataUrl);
      img.src = URL.createObjectURL(blob);
    } else {
      img.src = dataUrl;
    }
  });
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}



/* ─── main component ─────────────────────────────────────── */
function ImageConverterInner() {
  const toast = useToast();

  // file / preview state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [origMime, setOrigMime] = useState('');
  const [origInfo, setOrigInfo] = useState(null);   // { w, h, size }

  // settings
  const [targetFmt, setTargetFmt] = useState('image/jpeg');
  const [quality, setQuality] = useState(92);     // 1-100
  const [scale, setScale] = useState(100);    // 10-200
  const [icoSize, setIcoSize] = useState(32);
  const [targetSizeEnabled, setTargetSizeEnabled] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState(500);

  // output
  const [result, setResult] = useState(null);  // data-URL
  const [resultInfo, setResultInfo] = useState(null);  // { w, h, size, ext }

  // UI
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const blobUrlRef = useRef(null);
  const resultRef = useRef(null);

  /* ── handleFile ──────────────────────────────────────── */
  const handleFile = useCallback((f) => {
    if (!f) return;

    // validate size
    if (f.size > 50 * 1024 * 1024) {
      toast('File is too large. Maximum is 50 MB.', 'error');
      return;
    }

    // detect mime from extension first (more reliable than f.type for SVG/ICO)
    const ext = f.name.split('.').pop().toLowerCase();
    const detectedMime = EXT_TO_MIME[ext] || f.type || 'image/jpeg';

    // guard: must be an image
    if (!detectedMime.startsWith('image/') && !f.type.startsWith('image/')) {
      toast('Please upload an image file (JPG, PNG, WEBP, SVG, GIF, BMP, ICO…)', 'error');
      return;
    }

    // clean up old blob url
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }

    setFile(f);
    setResult(null);
    setResultInfo(null);
    setStatus(null);
    setProgress(0);
    setOrigMime(detectedMime);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);

      // get image dimensions
      const img = new Image();
      img.onload = () => setOrigInfo({ w: img.naturalWidth, h: img.naturalHeight, size: f.size });
      img.onerror = () => setOrigInfo({ w: '?', h: '?', size: f.size });

      if (detectedMime === 'image/svg+xml') {
        // use object URL so the SVG can reference its own assets
        const blobUrl = URL.createObjectURL(f);
        blobUrlRef.current = blobUrl;
        img.src = blobUrl;
      } else {
        img.src = dataUrl;
      }
    };
    reader.onerror = () => toast('Could not read file. Please try again.', 'error');
    reader.readAsDataURL(f);
  }, [toast]);

  /* ── convert ─────────────────────────────────────────── */
  const convert = useCallback(async () => {
    if (!preview || running) return;

    setRunning(true);
    setResult(null);
    setResultInfo(null);
    setProgress(10);
    setStatus({ type: 'processing', msg: 'Loading image…' });

    try {
      // 1. Decode the source image
      const img = await loadImageFromDataUrl(preview, origMime);
      setProgress(35);
      setStatus({ type: 'processing', msg: 'Rendering…' });

      // 2. Compute output dimensions
      const scaleFactor = Math.max(0.01, Math.min(20, scale / 100));
      let outW, outH;

      if (targetFmt === 'image/ico') {
        outW = icoSize;
        outH = icoSize;
      } else {
        outW = Math.max(1, Math.round(img.naturalWidth * scaleFactor));
        outH = Math.max(1, Math.round(img.naturalHeight * scaleFactor));
      }

      // guard against insane sizes
      if (outW > MAX_OUT_DIM || outH > MAX_OUT_DIM) {
        throw new Error(`Output too large (${outW}×${outH}px). Max is ${MAX_OUT_DIM}px. Lower the scale.`);
      }

      // 3. Draw onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');

      // Formats that don't support transparency need a white background
      const needsBg = ['image/jpeg', 'image/bmp', 'image/gif'].includes(targetFmt);
      if (needsBg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
      } else {
        ctx.clearRect(0, 0, outW, outH);
      }

      ctx.drawImage(img, 0, 0, outW, outH);

      // Release any object URL we created
      if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);

      setProgress(70);
      setStatus({ type: 'processing', msg: 'Encoding output…' });

      let finalBlob;
      // 4. Encode
      // Check if Smart Compression (Target Size) is enabled
      if (targetSizeEnabled) {
        setStatus({ type: 'processing', msg: 'Optimizing file size…' });
        const encodeMime = targetFmt === 'image/ico' ? 'image/png' : targetFmt;
        const initialBlob = await new Promise(resolve => canvas.toBlob(resolve, encodeMime, 0.95));
        const options = {
          maxSizeMB: targetSizeKB / 1024,
          maxWidthOrHeight: Math.max(outW, outH),
          useWebWorker: true,
          fileType: encodeMime,
          onProgress: (p) => setProgress(70 + (p * 0.25))
        };
        finalBlob = await imageCompression(initialBlob, options);
      } else {
        const encodeMime = targetFmt === 'image/ico' ? 'image/png' : targetFmt;
        const lossyFmts = ['image/jpeg', 'image/webp', 'image/avif'];
        const qualityArg = lossyFmts.includes(encodeMime) ? quality / 100 : undefined;
        finalBlob = await new Promise(resolve => canvas.toBlob(resolve, encodeMime, qualityArg));
      }

      const dataUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(finalBlob);
      });

      const fmtObj = FORMATS.find(f => f.value === targetFmt) || FORMATS[0];
      const outBytes = finalBlob.size;

      setResult(dataUrl);
      setResultInfo({ w: outW, h: outH, size: outBytes, ext: fmtObj.ext });
      setProgress(100);
      setStatus({ type: 'success', msg: `✓ Converted to ${fmtObj.ext.toUpperCase()} — ${fmtBytes(outBytes)}` });
      toast(`Converted to ${fmtObj.ext.toUpperCase()} successfully!`, 'success');

      // Auto-scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: `✗ ${err.message}` });
      toast(err.message, 'error');
      setProgress(0);
    } finally {
      setRunning(false);
    }
  }, [preview, origMime, running, targetFmt, quality, scale, icoSize, targetSizeEnabled, targetSizeKB, toast]);


  /* ── reset ───────────────────────────────────────────── */
  const reset = useCallback(() => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    setFile(null); setPreview(null); setOrigMime(''); setOrigInfo(null);
    setResult(null); setResultInfo(null); setStatus(null); setProgress(0); setRunning(false);
  }, []);

  /* ── derived ─────────────────────────────────────────── */
  const lossyOutput = ['image/jpeg', 'image/webp', 'image/avif'].includes(targetFmt);
  const fmtObj = FORMATS.find(f => f.value === targetFmt) || FORMATS[0];
  const outW = targetFmt === 'image/ico' ? icoSize : Math.round((origInfo?.w || 0) * scale / 100);
  const outH = targetFmt === 'image/ico' ? icoSize : Math.round((origInfo?.h || 0) * scale / 100);
  const outName = file ? `${file.name.replace(/\.[^.]+$/, '')}.${fmtObj.ext}` : `converted.${fmtObj.ext}`;

  /* ── render ──────────────────────────────────────────── */
  return (
    <div className="converter-page">
      <SEO
        title="Convert PNG to JPG High Quality – Free Image Converter Online"
        description="Fast and free image converter to convert between JPG, PNG, WEBP, SVG and 20+ other formats in high quality. No server uploads, 100% private."
        keywords="convert png to jpg high quality, online image converter, svg to png converter, webp to jpg online, best free image converter hub, image format changer, avif to jpg converter, heic to jpg online, ico maker, batch image converter"
        canonicalPath="/image-converter"
                ogImage="/og/image-converter.png"
        faqItems={[
          { q: 'How do I convert SVG to PNG?', a: 'Upload your SVG, select PNG as output, adjust scale if needed, then click Convert. The SVG is rendered at its natural viewport size.' },
          { q: 'What is WebP and why use it?', a: 'WebP is a modern image format by Google that is 25-35% smaller than JPEG at the same visual quality. Most modern browsers support it.' },
          { q: 'Does JPEG conversion lose quality?', a: 'Yes - JPEG uses lossy compression. At 90%+ quality the difference is barely visible. Use PNG for lossless output.' },
          { q: 'How do I make a favicon ICO file?', a: 'Upload your logo, select ICO format, choose 32x32 or 48x48 (standard favicon sizes), and convert. The ICO file saves as a PNG internally which browsers support.' },
          { q: 'Is there a file size limit?', a: 'Yes, 50 MB per file. For very high-resolution images, lower the scale to reduce output dimensions and memory usage.' }
        ]}
      />

      <ToolHeader
        title="Image"
        highlight="Format Converter"
        badge="✦ 9 Formats"
        desc="Convert between JPG, PNG, WebP, SVG, GIF, BMP, ICO and AVIF — instantly in your browser with no file uploads."
      />

      {/* Quick-pick pills */}
      <div className="format-quick">
        {[
          { from: 'SVG', to: 'PNG', setFmt: 'image/png' },
          { from: 'PNG', to: 'JPG', setFmt: 'image/jpeg' },
          { from: 'JPG', to: 'WebP', setFmt: 'image/webp' },
          { from: 'WebP', to: 'PNG', setFmt: 'image/png' },
          { from: 'PNG', to: 'ICO', setFmt: 'image/ico' },
          { from: 'BMP', to: 'JPG', setFmt: 'image/jpeg' },
          { from: 'GIF', to: 'PNG', setFmt: 'image/png' },
        ].map(({ from, to, setFmt }) => (
          <button key={from + to} type="button" className="fmt-pill"
            onClick={() => setTargetFmt(setFmt)}>
            <span className="fmt-from">{from}</span>
            <span className="fmt-arrow">→</span>
            <span className="fmt-to">{to}</span>
          </button>
        ))}
      </div>

      <ToolGrid>
        {/* ── Top Left: Upload ── */}
        <Panel title="Step 1: Upload Image">
          {!preview ? (
            <DropZone
              onFile={handleFile}
              onError={msg => toast(msg, 'error')}
              label="Drop any image to convert"
              sublabel="JPG, PNG, WEBP, SVG, GIF, BMP, TIFF, ICO, AVIF · Max 50 MB"
            />
          ) : (
            <div className="preview-stack">
              <PreviewBox minHeight={200}>
                <img src={preview} alt="Original" />
              </PreviewBox>
              {origInfo && (
                <InfoChips items={[
                  { label: 'Dimensions', value: origInfo.w === '?' ? '?' : `${origInfo.w}×${origInfo.h} px` },
                  { label: 'File Size', value: fmtBytes(origInfo.size) },
                  { label: 'Original Type', value: (file?.name.split('.').pop() || '?').toUpperCase() },
                ]} />
              )}
              <ResetBtn onClick={reset} />
            </div>
          )}
        </Panel>

        {/* ── Top Right: Settings or Info ── */}
        {!preview ? (
          <Panel title="Format Conversion Tips">
            <div className="tips-panel">
              <div className="tip-item">
                <span className="tip-icon">✨</span>
                <div>
                  <strong>Any → WebP:</strong> Convert any format to modern WebP for smaller web-optimized files.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⬢</span>
                <div>
                  <strong>SVG → PNG:</strong> Rasterize vector graphics at any scale with transparent background.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎨</span>
                <div>
                  <strong>Favicon Maker:</strong> Create proper .ICO files for websites from any image.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⚡</span>
                <div>
                  <strong>Scale & Resize:</strong> Adjust the dimensions during conversion to save bandwidth.
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Step 2: Conversion Settings">
            <div className="settings-scroll">
              <Control label="Output Format" id="target-fmt">
                <Select
                  id="target-fmt"
                  label="Select target image format"
                  value={targetFmt}
                  onChange={setTargetFmt}
                  options={FORMATS.map(f => ({ value: f.value, label: f.label }))}
                />
              </Control>

              <div className="settings-row">
                {lossyOutput && (
                  <Control label="Quality" hint={`${Math.round(quality)}%`} id="quality-slider">
                    <Slider
                      id="quality-slider"
                      label="Output quality"
                      min={1} max={100} step={1} value={quality} onChange={v => setQuality(Math.round(v))} formatValue={v => `${Math.round(v)}%`}
                    />
                  </Control>
                )}

                {targetFmt !== 'image/ico' ? (
                  <Control label="Scale" hint={outW && outH ? `${outW}×${outH} px` : `${Math.round(scale)}%`} id="scale-slider">
                    <Slider
                      id="scale-slider"
                      label="Image scale percentage"
                      min={10} max={200} step={1} value={scale} onChange={v => setScale(Math.round(v))} formatValue={v => `${Math.round(v)}%`}
                    />
                  </Control>
                ) : (
                  <Control label="ICO Size" id="ico-size">
                    <Select
                      id="ico-size"
                      label="Select ICO dimension"
                      value={String(icoSize)}
                      onChange={v => setIcoSize(Number(v))}
                      options={ICO_SIZES.map(s => ({ value: String(s), label: `${s}×${s} px` }))}
                    />
                  </Control>
                )}
              </div>

              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <TargetSizeControl
                  enabled={targetSizeEnabled}
                  onToggle={setTargetSizeEnabled}
                  value={targetSizeKB}
                  onChange={setTargetSizeKB}
                  min={Math.max(5, Math.round((origInfo?.size || 1024) / 1024 / 100))}
                  max={Math.round((origInfo?.size || 0) / 1024) || 10240}
                  step={5}
                />
              </div>

              <Btn onClick={convert} loading={running} disabled={running} aria-label="Convert and save image">
                🔄 Convert Image Now
              </Btn>
              <StatusBar status={status} />
              {running && <ProgressBar value={progress} label="Converting image" />}
            </div>
          </Panel>
        )}

        {/* ── Bottom: Result ── */}
        <Panel title="Step 3: Conversion Result" className="grid-full result-panel">
          <div ref={resultRef} />
          <div className="result-layout">
            <PreviewBox
              minHeight={300}
              checkerboard={targetFmt === 'image/png' || targetFmt === 'image/ico'}
              label="Converted image appears here"
            >
              {result && <img src={result} alt="Converted" className="result-img" style={{ maxWidth: '100%' }} />}
            </PreviewBox>

            {resultInfo && (
              <div className="result-actions">
                <InfoChips items={[
                  { label: 'Output Size', value: `${resultInfo.w}×${resultInfo.h}` },
                  { label: 'File Size', value: fmtBytes(resultInfo.size) },
                  { label: 'New Format', value: resultInfo.ext.toUpperCase() },
                ]} />
                <div className="download-wrap">
                  <DownloadBtn href={result} filename={outName}>
                    Download {resultInfo.ext.toUpperCase()} ({fmtBytes(resultInfo.size)})
                  </DownloadBtn>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </ToolGrid>

      <AdBanner slot="5555555555" />

      <FAQ items={[
        { q: 'How do I convert SVG to PNG?', a: 'Upload your SVG, select PNG as output, adjust scale if needed, then click Convert. The SVG is rendered at its natural viewport size.' },
        { q: 'What is WebP and why use it?', a: 'WebP is a modern image format by Google that is 25–35% smaller than JPEG at the same visual quality. Most modern browsers support it.' },
        { q: 'Does JPEG conversion lose quality?', a: 'Yes — JPEG uses lossy compression. At 90%+ quality the difference is barely visible. Use PNG for lossless output.' },
        { q: 'How do I make a favicon (ICO)?', a: 'Upload your logo, select ICO format, choose 32×32 or 48×48 (standard favicon sizes), and convert. The ICO file saves as a PNG internally which browsers support.' },
        { q: 'My AVIF output is blank — why?', a: 'AVIF encoding is not supported in all browsers yet (Safari and some Firefox versions). We fall back to WebP automatically when AVIF fails.' },
        { q: 'Is there a file size limit?', a: 'Yes, 50 MB per file. For very high-resolution images, lower the scale to reduce output dimensions and memory usage.' },
      ]} />
    </div>
  );
}

export default function ImageConverter() {
  return <ToastProvider><ImageConverterInner /></ToastProvider>;
}
