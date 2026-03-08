import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import imageCompression from 'browser-image-compression';
import DropZone from '../components/DropZone';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Control, Select, Slider, Btn,
  DownloadBtn, ResetBtn, StatusBar, ProgressBar, PreviewBox, InfoChips, AdBanner, FAQ, SEOContent, TargetSizeControl
} from "../components/ToolShell";
import '../components/ToolShell.css';
import './ImageCompressor.css';

/* ─── helpers ──────────────────────────────────────────── */
function fmtBytes(b) {
  if (!b && b !== 0) return '—';
  if (b === 0) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}



const FORMAT_OPTIONS = [
  { value: 'image/jpeg', label: 'JPEG – Smallest, lossy', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP – Best modern compression', ext: 'webp' },
  { value: 'image/png', label: 'PNG  – Lossless (larger)', ext: 'png' },
];

/* ─── main component ───────────────────────────────────── */
function ImageCompressorInner() {
  const toast = useToast();

  /* file state */
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [origSize, setOrigSize] = useState(0);
  const [origDim, setOrigDim] = useState(null);

  /* settings — all with explicit number types */
  const [targetSizeEnabled, setTargetSizeEnabled] = useState(false);
  const [maxSizeMB, setMaxSizeMB] = useState(1.0);    // float MB
  const [maxDim, setMaxDim] = useState(1920);    // integer px
  const [quality, setQuality] = useState(85);      // integer 1-100
  const [outputFmt, setOutputFmt] = useState('image/jpeg');

  /* output state */
  const [result, setResult] = useState(null);     // data-URL
  const [compSize, setCompSize] = useState(0);

  /* UI state */
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  /* Refs */
  const resultRef = useRef(null);

  /* ── load file ────────────────────────────────────────── */
  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast('Please upload an image file (JPG, PNG, WEBP, GIF, BMP…)', 'error');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast('File is too large. Maximum is 50 MB.', 'error');
      return;
    }

    setFile(f);
    setResult(null);
    setCompSize(0);
    setStatus(null);
    setProgress(0);
    setOrigSize(f.size);
    setOrigDim(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      const img = new Image();
      img.onload = () => setOrigDim({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = ev.target.result;
    };
    reader.onerror = () => toast('Could not read the file. Please try again.', 'error');
    reader.readAsDataURL(f);
  }, [toast]);

  /* ── compress ─────────────────────────────────────────── */
  const compress = useCallback(async () => {
    if (!file || isRunning) return;

    setIsRunning(true);
    setResult(null);
    setCompSize(0);
    setProgress(2);
    setStatus({ type: 'processing', msg: 'Starting compression…' });

    try {
      /* Validate settings */
      const safeSizeMB = Math.max(0.01, Math.min(50, maxSizeMB));
      const safeDim = Math.max(32, Math.min(8000, Math.round(maxDim)));
      const safeQ = Math.max(1, Math.min(100, Math.round(quality)));

      const outputMime = outputFmt === 'image/png' ? 'image/png' : outputFmt === 'image/webp' ? 'image/webp' : 'image/jpeg';
      let compressed;

      if (targetSizeEnabled && outputMime !== 'image/png') {
        const targetBytes = safeSizeMB * 1024 * 1024;
        setStatus({ type: 'processing', msg: 'Precise compression matching target size...' });

        const img = new Image();
        const tmpSrc = URL.createObjectURL(file);
        await new Promise(r => { img.onload = r; img.src = tmpSrc; });
        URL.revokeObjectURL(tmpSrc);

        let w = img.width, h = img.height;
        if (w > safeDim || h > safeDim) {
          const ratio = Math.min(safeDim / w, safeDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const tryBlob = (q) => new Promise(r => canvas.toBlob(r, outputMime, q));
        let maxBlob = await tryBlob(1.0);

        if (maxBlob.size <= targetBytes) {
          compressed = maxBlob;
        } else {
          // Binary search for exact KB target
          let low = 0.00;
          let high = 1.0;
          let bestBlob = null;
          for (let i = 0; i < 9; i++) {
            let mid = (low + high) / 2;
            let b = await tryBlob(mid);
            setProgress(10 + i * 10);
            if (b.size <= targetBytes) {
              bestBlob = b;
              low = mid;
            } else {
              high = mid;
            }
          }

          let currentQ = low;
          if (!bestBlob) bestBlob = await tryBlob(0.00);

          while (bestBlob.size > targetBytes && w > 50) {
            w = Math.round(w * 0.9); h = Math.round(h * 0.9);
            canvas.width = w; canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            let b = await tryBlob(currentQ);
            if (b.size <= targetBytes) {
              bestBlob = b;
              break;
            } else {
              bestBlob = b;
            }
          }
          compressed = bestBlob;
        }
      } else {
        const baseOpts = {
          maxWidthOrHeight: safeDim,
          useWebWorker: true,
          fileType: outputMime,
          onProgress: (pct) => {
            setProgress(Math.max(2, Math.min(95, pct)));
            setStatus({ type: 'processing', msg: `Compressing… ${pct}%` });
          },
        };
        const opts = targetSizeEnabled ? {
          ...baseOpts,
          maxSizeMB: safeSizeMB
        } : {
          ...baseOpts,
          initialQuality: safeQ / 100
        };
        compressed = await imageCompression(file, opts);
      }

      /* Read result as data URL for preview & download */
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(new Error('Failed to read compressed file'));
        r.readAsDataURL(compressed);
      });

      const reduction = origSize > 0
        ? Math.round((1 - compressed.size / origSize) * 100)
        : 0;

      setResult(dataUrl);
      setCompSize(compressed.size);
      setProgress(100);
      setStatus({
        type: 'success',
        msg: `Saved ${Math.max(0, reduction)}% — ${fmtBytes(origSize)} → ${fmtBytes(compressed.size)}`,
      });
      toast(`Done! File reduced by ${Math.max(0, reduction)}%`, 'success');

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
      setIsRunning(false);
    }
  }, [file, isRunning, maxSizeMB, maxDim, quality, outputFmt, origSize, toast, targetSizeEnabled]);

  /* ── reset ────────────────────────────────────────────── */
  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setOrigSize(0);
    setCompSize(0);
    setOrigDim(null);
    setStatus(null);
    setProgress(0);
    setIsRunning(false);
  }, []);

  /* ── derived ──────────────────────────────────────────── */
  const reduction = origSize && compSize
    ? Math.max(0, Math.round((1 - compSize / origSize) * 100))
    : 0;

  const fmtObj = FORMAT_OPTIONS.find(f => f.value === outputFmt) || FORMAT_OPTIONS[0];
  const outName = file
    ? `compressed-${file.name.replace(/\.[^.]+$/, '')}.${fmtObj.ext}`
    : `compressed.${fmtObj.ext}`;

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="compressor-page">
      <SEO
        title="Compress Image to 50KB or 100KB Online – Free Tool Hub"
        description="Reduce image size to 50KB, 100KB, or 200KB instantly. Perfect for official applications and document portals globally. 100% private and secure."
        keywords="compress image to 50kb online, reduce image size to 100kb, photo size reducer, official document compressor, free online image compressor, compress photo for government form, image kb reducer"
        canonicalPath="/image-compressor"
        ogImage="/og/image-compressor.png"
        faqItems={[
          { q: 'How can I compress my image to exactly 50KB or 100KB?', a: 'For government forms or exam uploads, use the Target Max Size slider. Set it to 0.05MB for a 50KB file or 0.1MB for a 100KB file. iLoveToolHub will automatically adjust the quality to stay under your limit.' },
          { q: 'Is this tool safe for government document uploads?', a: 'Yes. iLoveToolHub processes everything locally in your browser. Your official images or documents are never uploaded to our servers, making it 100% safe for sensitive document preparation.' },
          { q: 'What does Max Width and Height do?', a: 'It limits the largest dimension (width or height) of the output image. The image is scaled down proportionally if either dimension exceeds this value. Very useful for reducing resolution alongside file size.' },
          { q: 'Which format gives the best compression?', a: 'WebP is typically 25-35% smaller than JPEG at the same quality. JPEG offers the widest compatibility. PNG is lossless and usually produces larger files — use it only when you need pixel-perfect output.' },
          { q: 'Why is quality greyed out for PNG?', a: 'PNG uses lossless compression, so quality settings do not apply. File size is reduced by lowering resolution (Max Dimension) or by switching to a lossy format like JPEG or WebP.' },
          { q: 'Are my images uploaded anywhere?', a: 'No. All compression runs locally in your browser using Web Workers. Your images never leave your device.' }
        ]}
      />

      <ToolHeader
        title="Image"
        highlight="Compressor"
        badge="🗜️ 50KB / 100KB Ready"
        desc="Reduce image file sizes to the exact KB you need. Perfect for online applications, government forms, and exam uploads. Fast, free, and private."
      />

      <ToolGrid>
        {/* ── Top Left: Upload ── */}
        <Panel title="Step 1: Upload Image">
          {!preview ? (
            <DropZone
              onFile={handleFile}
              onError={msg => toast(msg, 'error')}
              label="Drop image here to compress"
              sublabel="JPG, PNG, WEBP, GIF, BMP · Max 50 MB"
            />
          ) : (
            <div className="preview-stack">
              <PreviewBox minHeight={200}>
                <img src={preview} alt="Original" />
              </PreviewBox>
              <InfoChips items={[
                { label: 'Original size', value: fmtBytes(origSize) },
                { label: 'Dimensions', value: origDim ? `${origDim.w}×${origDim.h}` : '…' },
                { label: 'Format', value: file?.name.split('.').pop().toUpperCase() || '?' },
              ]} />
              <ResetBtn onClick={reset} />
            </div>
          )}
        </Panel>

        {/* ── Top Right: Settings or Info ── */}
        {!preview ? (
          <Panel title="Compression Options">
            <div className="tips-panel">
              <div className="tip-item">
                <span className="tip-icon">🗜️</span>
                <div>
                  <strong>Lossless & Lossy:</strong> Choose between maximum compression or perfect quality.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🖼️</span>
                <div>
                  <strong>Smart Resize:</strong> Automatically downscale large images to reduce size.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">✨</span>
                <div>
                  <strong>Batch Modern:</strong> Convert old JPGs to modern WebP for best savings.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🚀</span>
                <div>
                  <strong>Local Speed:</strong> All processing happens in your browser for instant results.
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Step 2: Compression Settings">
            <div className="settings-scroll">
              <div style={{ marginBottom: 20 }}>
                <TargetSizeControl
                  enabled={targetSizeEnabled}
                  onToggle={setTargetSizeEnabled}
                  value={maxSizeMB * 1024}
                  onChange={(kb) => setMaxSizeMB(kb / 1024)}
                  min={Math.max(5, Math.round(origSize / 1024 / 100))}
                  max={Math.round(origSize / 1024)}
                  step={5}
                />
              </div>

              <Control label="Max Width / Height" hint={`${maxDim} px`} id="target-dim">
                <Slider
                  id="target-dim"
                  label="Target maximum image dimension in pixels"
                  min={100} max={8000} step={50} value={maxDim} onChange={v => setMaxDim(Math.round(v))} formatValue={v => `${v} px`}
                />
              </Control>

              <div className="settings-row">
                <Control label="Output Format" id="comp-fmt">
                  <Select
                    id="comp-fmt"
                    label="Select compressed output format"
                    value={outputFmt}
                    onChange={setOutputFmt}
                    options={FORMAT_OPTIONS.map(f => ({ value: f.value, label: f.label }))}
                  />
                </Control>

                {outputFmt !== 'image/png' && (
                  <Control label="Quality" hint={`${quality}%`} id="comp-quality">
                    <Slider
                      id="comp-quality"
                      label="Output image quality"
                      min={1} max={100} step={1} value={quality} onChange={v => setQuality(Math.round(v))} formatValue={v => `${Math.round(v)}%`}
                    />
                  </Control>
                )}
              </div>

              <div className="preset-row" role="group" aria-label="Compression presets">
                <span className="preset-label" id="presets-label">Direct presets:</span>
                <button type="button" className="preset-chip" onClick={() => { setMaxSizeMB(0.1); setQuality(70); setMaxDim(1280); setOutputFmt('image/jpeg'); }} aria-describedby="presets-label">Web Thumb</button>
                <button type="button" className="preset-chip" onClick={() => { setMaxSizeMB(0.5); setQuality(80); setMaxDim(1920); setOutputFmt('image/jpeg'); }} aria-describedby="presets-label">Social</button>
                <button type="button" className="preset-chip" onClick={() => { setMaxSizeMB(3); setQuality(92); setMaxDim(3840); setOutputFmt('image/jpeg'); }} aria-describedby="presets-label">High Qual</button>
              </div>

              <Btn onClick={compress} loading={isRunning} disabled={isRunning} aria-label="Start Image Compression">
                🗜️ Start Compression
              </Btn>
              <StatusBar status={status} />
              {isRunning && <ProgressBar value={progress} label="Compressing images" />}
            </div>
          </Panel>
        )}

        {/* ── Bottom: Result ── */}
        <Panel title="Step 3: Compressed Result" className="grid-full result-panel">
          <div ref={resultRef} />
          <div className="result-layout">
            <PreviewBox minHeight={300} label="Compressed image appears here">
              {result && <img src={result} alt="Compressed result" className="result-img" style={{ maxWidth: '100%' }} />}
            </PreviewBox>

            {result && (
              <div className="result-actions">
                <div className="savings-card-mini">
                  <div className="savings-title">Reduction: <strong>{reduction}%</strong></div>
                  <div className="savings-meta">{fmtBytes(origSize)} → {fmtBytes(compSize)}</div>
                </div>
                <div className="download-wrap">
                  <DownloadBtn href={result} filename={outName}>
                    Download {fmtObj.ext.toUpperCase()} ({fmtBytes(compSize)})
                  </DownloadBtn>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </ToolGrid>

      <AdBanner slot="8888888888" />

      <SEOContent title="How to Compress Images for Official Portals Online">
        <p>Reducing image file size is essential for fast websites, official document portals, and application forms. iLoveToolHub allows you to compress images to specific sizes like 50KB, 100KB, or 200KB without losing critical quality.</p>

        <h3>Perfect for Global Application Portals</h3>
        <p>Many official and educational portals require photos to be under specific file limits (e.g., under 50KB or 100KB). Our intelligent algorithm analyzes your image and applies the perfect balance of resolution and compression to meet these strict requirements.</p>

        <h3>Why use iLoveToolHub for Image Compression?</h3>
        <ul>
          <li><strong>Privacy First:</strong> Your photos never reach our servers. Everything happens entirely in your browser.</li>
          <li><strong>Precise KB Goals:</strong> Use our "Target Max Size" feature to hit your exact file size limits.</li>
          <li><strong>Quality Control:</strong> Manually adjust the quality to find the perfect look for your compressed image.</li>
          <li><strong>Format Support:</strong> Convert and compress JPG, PNG, and WebP instantly with zero cost.</li>
        </ul>

        <h3>Step-by-Step Guide to Under 50KB</h3>
        <p>1. Upload your photo above.<br />2. Slide the "Target Max Size" to 0.05MB (which is 50KB).<br />3. Click "Compress Image".<br />4. Download your perfectly sized result.</p>
      </SEOContent>

      <FAQ items={[
        {
          q: 'How can I compress my image to exactly 50KB or 100KB?',
          a: 'For government forms or exam uploads, use the "Target Max Size" slider. Set it to 0.05MB for a 50KB file or 0.1MB for a 100KB file. iLoveToolHub will automatically adjust the quality to stay under your limit.',
        },
        {
          q: 'Is this tool safe for government document uploads?',
          a: 'Yes. iLoveToolHub processes everything locally in your browser. Your official images or documents are never uploaded to our servers, making it 100% safe for sensitive document preparation.',
        },
        {
          q: 'What does "Max Width / Height" do?',
          a: 'It limits the largest dimension (width or height) of the output image. The image is scaled down proportionally if either dimension exceeds this value. Very useful for reducing resolution alongside file size.',
        },
        {
          q: 'Which format gives the best compression?',
          a: 'WebP is typically 25–35% smaller than JPEG at the same quality. JPEG offers the widest compatibility. PNG is lossless and usually produces larger files — use it only when you need pixel-perfect output.',
        },
        {
          q: 'Why is quality greyed out for PNG?',
          a: 'PNG uses lossless compression, so quality settings do not apply. File size is reduced by lowering resolution (Max Dimension) or by switching to a lossy format like JPEG or WebP.',
        },
        {
          q: 'Are my images uploaded anywhere?',
          a: 'No. All compression runs locally in your browser using Web Workers. Your images never leave your device.',
        },
      ]} />
    </div>
  );
}

export default function ImageCompressor() {
  return (
    <ToastProvider>
      <ImageCompressorInner />
    </ToastProvider>
  );
}
