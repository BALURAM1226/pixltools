import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import imageCompression from 'browser-image-compression';
import DropZone from '../components/DropZone';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Control, Select, Slider, Btn,
  DownloadBtn, ResetBtn, StatusBar, ProgressBar, PreviewBox, InfoChips, AdBanner, FAQ,
} from '../components/ToolShell';
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

function sizeLabelMB(mb) {
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
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
  const abortRef = useRef(null);
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

      /* browser-image-compression options */
      const opts = {
        maxSizeMB: safeSizeMB,
        maxWidthOrHeight: safeDim,
        useWebWorker: true,
        /* quality only applies to lossy formats */
        initialQuality: safeQ / 100,
        /* tell the lib what format to output */
        fileType: outputFmt === 'image/png' ? 'image/png'
          : outputFmt === 'image/webp' ? 'image/webp'
            : 'image/jpeg',
        onProgress: (pct) => {
          setProgress(Math.max(2, Math.min(95, pct)));
          setStatus({ type: 'processing', msg: `Compressing… ${pct}%` });
        },
      };

      const compressed = await imageCompression(file, opts);

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
      const msg = err?.message || 'Unknown compression error';
      setStatus({ type: 'error', msg: `Error: ${msg}` });
      toast(msg, 'error');
      setProgress(0);
    } finally {
      setIsRunning(false);
    }
  }, [file, isRunning, maxSizeMB, maxDim, quality, outputFmt, origSize, toast]);

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
    <>
      <SEO
        title="Image Compressor – Reduce Image Size (MB/KB)"
        description="Compress images or reduce file size without losing quality. Set target MB or percentage. Supports PNG, JPG, and WEBP. Browser-local processing."
        canonicalPath="/image-compressor"
      />

      <ToolHeader
        title="Image"
        highlight="Compressor"
        badge="🗜️ Up to 90% Smaller"
        desc="Reduce image file sizes dramatically without visible quality loss. Target size, max dimension, quality, and format are all fully configurable."
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
              <Control label="Target Max Size" hint={sizeLabelMB(maxSizeMB)}>
                <Slider min={0.05} max={20} step={0.05} value={maxSizeMB} onChange={setMaxSizeMB} formatValue={sizeLabelMB} />
              </Control>

              <Control label="Max Width / Height" hint={`${maxDim} px`}>
                <Slider min={100} max={8000} step={50} value={maxDim} onChange={v => setMaxDim(Math.round(v))} formatValue={v => `${v} px`} />
              </Control>

              <div className="settings-row">
                <Control label="Output Format">
                  <Select value={outputFmt} onChange={setOutputFmt} options={FORMAT_OPTIONS.map(f => ({ value: f.value, label: f.label }))} />
                </Control>

                {outputFmt !== 'image/png' && (
                  <Control label="Quality" hint={`${quality}%`}>
                    <Slider min={1} max={100} step={1} value={quality} onChange={v => setQuality(Math.round(v))} formatValue={v => `${v}%`} />
                  </Control>
                )}
              </div>

              <div className="preset-row">
                <span className="preset-label">Direct presets:</span>
                <button type="button" className="preset-chip" onClick={() => { setMaxSizeMB(0.1); setQuality(70); setMaxDim(1280); setOutputFmt('image/jpeg'); }}>Web Thumb</button>
                <button type="button" className="preset-chip" onClick={() => { setMaxSizeMB(0.5); setQuality(80); setMaxDim(1920); setOutputFmt('image/jpeg'); }}>Social</button>
                <button type="button" className="preset-chip" onClick={() => { setMaxSizeMB(3); setQuality(92); setMaxDim(3840); setOutputFmt('image/jpeg'); }}>High Qual</button>
              </div>

              <Btn onClick={compress} loading={isRunning} disabled={isRunning}>
                🗜️ Start Compression
              </Btn>
              <StatusBar status={status} />
              {isRunning && <ProgressBar value={progress} />}
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

      <FAQ items={[
        {
          q: 'Why is "Target Max Size" not always reached exactly?',
          a: 'The compression library tries to get below your target but some images (especially PNG) cannot be compressed below a certain size without converting format. If you need a smaller file, try switching to JPEG or WebP output.',
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
    </>
  );
}

export default function ImageCompressor() {
  return (
    <ToastProvider>
      <ImageCompressorInner />
    </ToastProvider>
  );
}
