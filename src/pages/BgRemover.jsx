import React, { useState, useCallback, useRef, useEffect } from 'react';
import SEO from '../components/SEO';
import DropZone from '../components/DropZone';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn,
  DownloadBtn, ResetBtn, StatusBar, ProgressBar, PreviewBox, AdBanner, FAQ, SEOContent, TargetSizeControl
} from '../components/ToolShell';
import imageCompression from 'browser-image-compression';
import '../components/ToolShell.css';
import './BgRemover.css';

const BG_OPTIONS = [
  { id: 'transparent', label: 'Transparent', checker: true },
  { id: '#ffffff', label: 'White', hex: '#ffffff' },
  { id: '#000000', label: 'Black', hex: '#000000' },
  { id: '#1e3a5f', label: 'Dark Blue', hex: '#1e3a5f' },
  { id: '#1a4731', label: 'Dark Green', hex: '#1a4731' },
  { id: '#4a1942', label: 'Purple', hex: '#4a1942' },
  { id: '__custom__', label: 'Custom', picker: true },
];

function BgRemoverInner() {
  const toast = useToast();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [rawResultBlob, setRawResultBlob] = useState(null); // AI transparent result
  // data-URL or blob-URL
  const [bgChoice, setBgChoice] = useState('transparent');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [targetSizeEnabled, setTargetSizeEnabled] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState(500);
  const resultBlobRef = useRef(null);
  const resultRef = useRef(null);

  /* ── file load ───────────────────────────────────────── */
  const handleFile = useCallback((f) => {
    if (!f.type.startsWith('image/')) { toast('Please upload an image file.', 'error'); return; }
    if (f.size > 50 * 1024 * 1024) { toast('File too large. Max 50 MB.', 'error'); return; }

    // release old result blob
    if (resultBlobRef.current) { URL.revokeObjectURL(resultBlobRef.current); resultBlobRef.current = null; }

    setFile(f); setResult(null); setStatus(null); setProgress(0); setRawResultBlob(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.onerror = () => toast('Could not read file.', 'error');
    reader.readAsDataURL(f);
  }, [toast]);

  /* ── remove background ───────────────────────────────── */
  const removeBg = useCallback(async () => {
    if (!file || running) return;

    setRunning(true);
    setResult(null);
    setProgress(3);
    setStatus({ type: 'processing', msg: 'Loading AI model… first run may take ~30 s' });

    try {
      // Dynamic import keeps initial bundle small
      const { removeBackground } = await import('@imgly/background-removal');
      setProgress(15);
      setStatus({ type: 'processing', msg: 'AI is analysing your image…' });

      const resultBlob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 70);
            setProgress(15 + pct);
          }
        },
      });

      setRawResultBlob(resultBlob); // Store for live updates
    } catch (err) {
      console.error('[BgRemover AI Error]', err);
      setStatus({ type: 'error', msg: `AI Error: ${err.message}` });
      toast('Background removal failed', 'error');
      setRunning(false);
    }
  }, [file, running, toast]);

  /* ── composite & compress ─────────────────────────────── */
  const applyFinalSettings = useCallback(async () => {
    if (!rawResultBlob) return;
    setRunning(true);
    try {
      // Effective background colour
      const effectiveBg = bgChoice === '__custom__' ? customHex : bgChoice;
      let workBlob;

      if (effectiveBg === 'transparent') {
        workBlob = rawResultBlob;
      } else {
        // Composite onto a coloured canvas
        const img = new Image();
        const tmpUrl = URL.createObjectURL(rawResultBlob);

        workBlob = await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = effectiveBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(tmpUrl);
            canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
          };
          img.onerror = () => { URL.revokeObjectURL(tmpUrl); reject(new Error('Could not composite background')); };
          img.src = tmpUrl;
        });
      }

      // Apply Smart Compression if enabled
      if (targetSizeEnabled) {
        setStatus({ type: 'processing', msg: 'Optimizing file size…' });
        const encodeMime = effectiveBg === 'transparent' ? 'image/png' : 'image/jpeg';
        const options = {
          maxSizeMB: targetSizeKB / 1024,
          maxWidthOrHeight: 4000, // Hint for downscaling if quality reduction isn't enough
          useWebWorker: true,
          fileType: encodeMime
        };
        workBlob = await imageCompression(workBlob, options);
      }

      if (resultBlobRef.current) URL.revokeObjectURL(resultBlobRef.current);
      resultBlobRef.current = URL.createObjectURL(workBlob);
      setResult(resultBlobRef.current);

      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Background processed successfully!' });
    } catch (err) {
      console.error('[BgRemover Apply Error]', err);
      setStatus({ type: 'error', msg: `Processing Error: ${err.message}` });
    } finally {
      setRunning(false);
    }
  }, [rawResultBlob, bgChoice, customHex, targetSizeEnabled, targetSizeKB]);


  /* ── reset ───────────────────────────────────────────── */
  const reset = useCallback(() => {
    if (resultBlobRef.current) { URL.revokeObjectURL(resultBlobRef.current); resultBlobRef.current = null; }
    setFile(null); setPreview(null); setResult(null);
    setRawResultBlob(null);
    setStatus(null); setProgress(0); setRunning(false);
  }, []);

  /* ── derived ─────────────────────────────────────────── */
  const isTransparent = bgChoice === 'transparent';
  const outName = file ? `bg-removed-${file.name.replace(/\.[^.]+$/, '')}.png` : 'bg-removed.png';
  const effectiveBgCss = bgChoice === '__custom__' ? customHex
    : bgChoice === 'transparent' ? 'transparent'
      : bgChoice;

  return (
    <div className="remover-page">
      <SEO
        title="Remove Image BG Online Free – AI Background Remover"
        description="Automatically remove image backgrounds using AI for free. Get transparent PNGs instantly. No server uploads – 100% private and safe for official documents."
        keywords="remove image bg online free, transparent png maker, background remover online, ai background removal, remove background from photo free"
        canonicalPath="/background-remover"
      />

      <ToolHeader
        title="AI Background"
        highlight="Remover"
        badge="🤖 AI Powered"
        desc="Remove image backgrounds automatically using a neural network that runs entirely in your browser. No image data is ever sent to a server."
      />

      {/* Info notice */}
      <div className="ai-notice">
        <span className="ai-icon">🤖</span>
        <div>
          <strong>Runs 100% in your browser</strong> — The AI model (~60 MB) is downloaded once and then cached locally. First use takes ~30 seconds; all subsequent uses are instant.
        </div>
      </div>

      <ToolGrid>
        {/* ── Top Left: Upload ── */}
        <Panel title="Step 1: Upload Image">
          {!preview ? (
            <DropZone
              onFile={handleFile}
              onError={msg => toast(msg, 'error')}
              label="Drop image for background removal"
              sublabel="JPG, PNG, WEBP · Works best with clear subjects · Max 50 MB"
            />
          ) : (
            <div className="preview-stack">
              <PreviewBox minHeight={240}>
                <img src={preview} alt="Original" />
              </PreviewBox>
              <ResetBtn onClick={reset} />
            </div>
          )}
        </Panel>

        {/* ── Top Right: Settings or Info ── */}
        {!preview ? (
          <Panel title="How it Works">
            <div className="tips-panel">
              <div className="tip-item">
                <span className="tip-icon">🤖</span>
                <div>
                  <strong>AI Analysis:</strong> Our neural network identifies the main subject of your photo.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">✨</span>
                <div>
                  <strong>Precise Cut:</strong> Background is removed with pixel-perfect accuracy.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎨</span>
                <div>
                  <strong>Custom BG:</strong> Replace background with transparency or any solid color.
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔒</span>
                <div>
                  <strong>Privacy:</strong> Processing happens in your browser. No images are uploaded.
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Step 2: Output Background">
            {/* Preset grid */}
            <div className="bg-grid" role="radiogroup" aria-label="Select output background">
              {BG_OPTIONS.map(opt => (
                <button key={opt.id} type="button"
                  id={`bg-option-${opt.id.replace('#', '')}`}
                  role="radio"
                  aria-checked={bgChoice === opt.id}
                  className={`bg-btn ${bgChoice === opt.id ? 'active' : ''}`}
                  onClick={() => setBgChoice(opt.id)}
                  aria-label={`Change background to ${opt.label}`}
                >
                  {opt.checker && <span className="bg-checker-swatch" aria-hidden="true" />}
                  {opt.hex && <span className="bg-color-swatch" style={{ background: opt.hex }} aria-hidden="true" />}
                  {opt.picker && (
                    <span className="bg-color-swatch" style={{ background: customHex }}
                      title="Click to pick colour" aria-hidden="true" />
                  )}
                  <span className="bg-btn-label">{opt.label}</span>
                </button>
              ))}
            </div>

            {bgChoice === '__custom__' && (
              <div className="custom-color-row">
                <label className="custom-label" htmlFor="bg-custom-picker">Custom color:</label>
                <input
                  id="bg-custom-picker"
                  type="color"
                  value={customHex}
                  onChange={e => setCustomHex(e.target.value)}
                  className="custom-picker"
                  aria-label="Pick custom background color"
                />
                <span className="custom-hex" aria-hidden="true">{customHex}</span>
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <TargetSizeControl
                enabled={targetSizeEnabled}
                onToggle={setTargetSizeEnabled}
                value={targetSizeKB}
                onChange={setTargetSizeKB}
                min={Math.max(5, Math.round((file?.size || 1024) / 1024 / 100))}
                max={Math.round((file?.size || 0) / 1024) || 10240}
                step={5}
              />
            </div>

            <div className="bg-action-wrap" style={{ marginTop: 24 }}>
              <Btn onClick={rawResultBlob ? applyFinalSettings : removeBg} loading={running} disabled={running}>
                {rawResultBlob ? '✨ Apply Background Settings' : '🪄 Remove Background Now'}
              </Btn>
              <StatusBar status={status} />
              {running && <ProgressBar value={progress} label="Removing background" />}
            </div>
          </Panel>
        )}

        {/* ── Bottom: Result ── */}
        <Panel title="Step 3: Result" className="grid-full result-panel">
          <div ref={resultRef} />
          <div className="result-layout">
            <PreviewBox
              minHeight={340}
              checkerboard={isTransparent}
              label="Background-removed image appears here"
            >
              {result && (
                <img
                  src={result}
                  alt="Background removed"
                  className="result-img"
                  style={{ background: isTransparent ? 'none' : effectiveBgCss, maxWidth: '100%' }}
                />
              )}
            </PreviewBox>

            {result && (
              <div className="result-actions">
                <div className="result-meta">
                  <span className="result-ok">
                    ✓ Background {isTransparent ? 'removed (transparent)' : 'replaced'}
                  </span>
                  <span className="result-fmt">PNG · Lossless</span>
                </div>
                <div className="download-wrap">
                  <DownloadBtn href={result} filename={outName}>
                    Download PNG
                  </DownloadBtn>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </ToolGrid>

      <AdBanner slot="9999999999" />

      <SEOContent title="AI Background Remover Online – 100% Free & Private">
        <p>Removing the background from an image used to require expensive software like Photoshop. Now, with iLoveToolHub's AI-powered background remover, you can create high-quality transparent PNGs in seconds, completely free and directly in your browser.</p>

        <h3>Create Transparent PNGs for Any Purpose</h3>
        <p>Whether you're an e-commerce seller needing clean product photos, a graphic designer workspace, or a professional creating official documents, our tool provides studio-quality results. Our AI model specifically identifies subjects and cleans up edges for a <strong>pixel-perfect transparent background</strong>.</p>

        <h3>Privacy First Background Removal</h3>
        <ul>
          <li><strong>No Data Leaks:</strong> Unlike other popular AI tools, we don't send your images to a remote server. The AI heavy-lifting happens 100% on your local CPU/GPU.</li>
          <li><strong>High Precision:</strong> Our model handles hair, fur, and complex edges with surprising accuracy.</li>
          <li><strong>Custom Backgrounds:</strong> Once the background is removed, you can instantly add a solid color or a gradient to your subject.</li>
          <li><strong>Commercial Use:</strong> The output is yours to keep. No watermarks, no hidden fees—ever.</li>
          <li><strong> Commercial Use: </strong> The output is yours to keep. No watermarks, no hidden fees—ever. </li>
        </ul>

        <h3>How to Remove Background from Image Online</h3>
        <p>1. Upload your photo (JPG, PNG, or WebP).<br />2. Click "Remove Background Now" to start the AI analysis.<br />3. Choose a transparent background or select a custom color.<br />4. Download your professional PNG result.</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Is this AI background remover free for commercial use?', a: 'Absolutely. iLoveToolHub provides this AI tool 100% free. You can use the transparent PNG results for your website, marketing, or personal projects without any watermarks.' },
        { q: 'How can I make an image background transparent?', a: 'Simply upload your photo, click "Remove Background Now", and ensure the "Transparent" option is selected. You will get a high-quality PNG with no background instantly.' },
        { q: 'Why does the first run take longer?', a: 'The AI model weights (~60 MB) are downloaded on first use and cached in your browser. All subsequent uses load the cached model instantly.' },
        { q: 'What format is the output?', a: 'Always PNG, which supports transparency. If you choose a background colour, the PNG will have that colour as its background.' },
        { q: 'Can I use the result commercially?', a: 'Yes. The AI runs on open-source models in your browser. The output image is yours — you own it completely.' },
      ]} />
    </div >
  );
}

export default function BgRemover() {
  return <ToastProvider><BgRemoverInner /></ToastProvider>;
}
