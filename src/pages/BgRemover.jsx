import React, { useState, useCallback, useRef } from 'react';
import SEO from '../components/SEO';
import DropZone from '../components/DropZone';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn,
  DownloadBtn, ResetBtn, StatusBar, ProgressBar, PreviewBox, AdBanner, FAQ,
} from '../components/ToolShell';
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
  const [result, setResult] = useState(null);   // data-URL or blob-URL
  const [bgChoice, setBgChoice] = useState('transparent');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const resultBlobRef = useRef(null);
  const resultRef = useRef(null);

  /* ── file load ───────────────────────────────────────── */
  const handleFile = useCallback((f) => {
    if (!f.type.startsWith('image/')) { toast('Please upload an image file.', 'error'); return; }
    if (f.size > 50 * 1024 * 1024) { toast('File too large. Max 50 MB.', 'error'); return; }

    // release old result blob
    if (resultBlobRef.current) { URL.revokeObjectURL(resultBlobRef.current); resultBlobRef.current = null; }

    setFile(f); setResult(null); setStatus(null); setProgress(0);
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

      setProgress(90);
      setStatus({ type: 'processing', msg: 'Applying background…' });

      // Effective background colour
      const effectiveBg = bgChoice === '__custom__' ? customHex : bgChoice;

      if (effectiveBg === 'transparent') {
        // Serve directly as blob-URL (smaller memory footprint)
        if (resultBlobRef.current) URL.revokeObjectURL(resultBlobRef.current);
        resultBlobRef.current = URL.createObjectURL(resultBlob);
        setResult(resultBlobRef.current);
      } else {
        // Composite onto a coloured canvas
        const img = new Image();
        const tmpUrl = URL.createObjectURL(resultBlob);

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = effectiveBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(tmpUrl);
            setResult(canvas.toDataURL('image/png', 1.0));
            resolve();
          };
          img.onerror = () => { URL.revokeObjectURL(tmpUrl); reject(new Error('Could not composite background')); };
          img.src = tmpUrl;
        });
      }

      setProgress(100);
      setStatus({ type: 'success', msg: '✓ Background removed successfully!' });
      toast('Background removed!', 'success');

      // Auto-scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err) {
      console.error('[BgRemover]', err);
      const isNetwork = /fetch|network|load/i.test(err.message || '');
      const msg = isNetwork
        ? 'Could not download AI model. Check your internet connection and try again.'
        : `Error: ${err.message || 'Unknown error'}`;
      setStatus({ type: 'error', msg: `✗ ${msg}` });
      toast(msg, 'error');
      setProgress(0);
    } finally {
      setRunning(false);
    }
  }, [file, running, bgChoice, customHex, toast]);

  /* ── reset ───────────────────────────────────────────── */
  const reset = useCallback(() => {
    if (resultBlobRef.current) { URL.revokeObjectURL(resultBlobRef.current); resultBlobRef.current = null; }
    setFile(null); setPreview(null); setResult(null);
    setStatus(null); setProgress(0); setRunning(false);
  }, []);

  /* ── derived ─────────────────────────────────────────── */
  const isTransparent = bgChoice === 'transparent';
  const outName = file ? `bg-removed-${file.name.replace(/\.[^.]+$/, '')}.png` : 'bg-removed.png';
  const effectiveBgCss = bgChoice === '__custom__' ? customHex
    : bgChoice === 'transparent' ? 'transparent'
      : bgChoice;

  return (
    <>
      <SEO
        title="AI Background Remover – Remove Image BG Online Free"
        description="Automatically remove image backgrounds using AI. No uploads required – processing happens in your browser. Fast, free, and private."
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
            <div className="bg-grid">
              {BG_OPTIONS.map(opt => (
                <button key={opt.id} type="button"
                  className={`bg-btn ${bgChoice === opt.id ? 'active' : ''}`}
                  onClick={() => setBgChoice(opt.id)}
                >
                  {opt.checker && <span className="bg-checker-swatch" />}
                  {opt.hex && <span className="bg-color-swatch" style={{ background: opt.hex }} />}
                  {opt.picker && (
                    <span className="bg-color-swatch" style={{ background: customHex }}
                      title="Click to pick colour" />
                  )}
                  <span className="bg-btn-label">{opt.label}</span>
                </button>
              ))}
            </div>

            {bgChoice === '__custom__' && (
              <div className="custom-color-row">
                <label className="custom-label">Custom color:</label>
                <input
                  type="color"
                  value={customHex}
                  onChange={e => setCustomHex(e.target.value)}
                  className="custom-picker"
                />
                <span className="custom-hex">{customHex}</span>
              </div>
            )}

            <Btn onClick={removeBg} loading={running} disabled={running}>
              ✂️ Remove Background Now
            </Btn>
            <StatusBar status={status} />
            {running && <ProgressBar value={progress} />}
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

      <FAQ items={[
        { q: 'How does AI background removal work?', a: 'The tool uses the @imgly/background-removal library which runs the RMBG neural network via WebAssembly in your browser. No image data leaves your device.' },
        { q: 'What images work best?', a: 'Images with a clear subject (person, product, animal) against a contrasting background. Well-lit photos with defined edges give the best results.' },
        { q: 'Why does the first run take longer?', a: 'The AI model weights (~60 MB) are downloaded on first use and cached in your browser. All subsequent uses load the cached model instantly.' },
        { q: 'What format is the output?', a: 'Always PNG, which supports transparency. If you choose a background colour, the PNG will have that colour as its background.' },
        { q: 'Can I use the result commercially?', a: 'Yes. The AI runs on open-source models in your browser. The output image is yours — you own it completely.' },
      ]} />
    </>
  );
}

export default function BgRemover() {
  return <ToastProvider><BgRemoverInner /></ToastProvider>;
}
