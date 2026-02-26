import React, { useEffect, useRef } from 'react';
import './ToolShell.css';

/* ─── Google AdSense Banner ─────────────────────────────── */
export function AdBanner({ slot }) {
  const ref = useRef(null);
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !ref.current) return;
    fired.current = true;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { }
  }, []);
  return (
    <div className="ad-wrap">
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true" />
      {process.env.NODE_ENV === 'development' && (
        <div className="ad-placeholder">
          <span>📢 Google AdSense · Slot: {slot}</span>
          <span>Replace ca-pub-XXXXXXXXXXXXXXXX with your Publisher ID</span>
        </div>
      )}
    </div>
  );
}

/* ─── Tool Header ────────────────────────────────────────── */
export function ToolHeader({ title, highlight, desc, badge }) {
  return (
    <div className="tool-header">
      {badge && <span className="tool-badge">{badge}</span>}
      <h1 className="tool-title">
        {title}{highlight && <> <span className="highlight">{highlight}</span></>}
      </h1>
      {desc && <p className="tool-desc">{desc}</p>}
    </div>
  );
}

/* ─── Two-column grid ────────────────────────────────────── */
export function ToolGrid({ children }) {
  return <div className="tool-grid">{children}</div>;
}

/* ─── Panel card ─────────────────────────────────────────── */
export function Panel({ title, children, className = '' }) {
  return (
    <div className={`panel ${className}`}>
      {title && <div className="panel-title">{title}</div>}
      <div className="panel-body">{children}</div>
    </div>
  );
}

/* ─── Control row ────────────────────────────────────────── */
export function Control({ label, hint, children }) {
  return (
    <div className="control">
      {(label || hint) && (
        <div className="control-header">
          {label && <span className="control-label">{label}</span>}
          {hint && <span className="control-hint">{hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Slider ─────────────────────────────────────────────── *
 *  ROOT CAUSE FIX: CSS var() set via inline style on        *
 *  <input> does NOT cascade into ::webkit-slider-runnable-  *
 *  track pseudo-element in Firefox/Safari. We write the     *
 *  gradient directly into the element's style attribute     *
 *  so every browser applies it to the track correctly.      */
export function Slider({ min, max, step = 1, value, onChange, formatValue }) {
  const numVal = parseFloat(value) || 0;
  const numMin = parseFloat(min) || 0;
  const numMax = parseFloat(max) || 100;
  const pct = Math.max(0, Math.min(100, ((numVal - numMin) / (numMax - numMin)) * 100));

  return (
    <div className="slider-wrap">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numVal}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="slider"
        style={{
          background: `linear-gradient(to right, #63b3ed ${pct}%, rgba(255,255,255,0.09) ${pct}%)`
        }}
      />
      <span className="slider-val">
        {formatValue ? formatValue(numVal) : numVal}
      </span>
    </div>
  );
}

/* ─── Select ─────────────────────────────────────────────── *
 *  FIX: HTML select always returns a STRING from            *
 *  e.target.value. Stringify the controlled value so        *
 *  React doesn't show "uncontrolled" warnings and the       *
 *  comparison works correctly even for numeric values.      */
export function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="select-wrap">
      <select
        value={String(value)}
        onChange={e => onChange(e.target.value)}
        className="select"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o, i) =>
          typeof o === 'string'
            ? <option key={i} value={o}>{o}</option>
            : <option key={i} value={String(o.value)}>{o.label}</option>
        )}
      </select>
      <svg className="select-arrow" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* ─── Primary button ─────────────────────────────────────── */
export function Btn({ onClick, disabled, loading, children, variant = 'primary', full = true }) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${full ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

/* ─── Download link ──────────────────────────────────────── */
export function DownloadBtn({ href, filename, children }) {
  if (!href) return null;
  return (
    <a href={href} download={filename} className="btn btn-success btn-full">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {children}
    </a>
  );
}

/* ─── Ghost reset button ─────────────────────────────────── */
export function ResetBtn({ onClick }) {
  return (
    <button type="button" className="btn btn-ghost btn-full" onClick={onClick}>
      ↺ Start over
    </button>
  );
}

/* ─── Status bar ─────────────────────────────────────────── */
export function StatusBar({ status }) {
  if (!status) return null;
  const cls = { processing: 'status-processing', success: 'status-success', error: 'status-error', warning: 'status-warning' };
  const icon = { success: '✓', error: '✕', warning: '⚠' };
  return (
    <div className={`status-bar ${cls[status.type] || ''}`}>
      {status.type === 'processing'
        ? <span className="spinner" />
        : <span className="status-icon">{icon[status.type]}</span>}
      <span>{status.msg}</span>
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────── */
export function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ─── Preview box ────────────────────────────────────────── */
export function PreviewBox({ children, checkerboard = false, minHeight = 260, label }) {
  return (
    <div className={`preview-box ${checkerboard ? 'checker' : ''}`} style={{ minHeight }}>
      {children || (
        <div className="preview-empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1" opacity="0.25">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{label || 'Result will appear here'}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Info chips ─────────────────────────────────────────── */
export function InfoChips({ items }) {
  return (
    <div className="info-chips">
      {items.map((item, i) => (
        <div key={i} className="info-chip">
          <span className="chip-label">{item.label}</span>
          <span className="chip-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── FAQ ────────────────────────────────────────────────── */
export function FAQ({ items }) {
  return (
    <div className="faq">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {items.map((item, i) => (
          <div key={i} className="faq-item">
            <h3 className="faq-q">{item.q}</h3>
            <p className="faq-a">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ─── SEO Content Block ───────────────────────────────────── */
export function SEOContent({ title, children }) {
  return (
    <div className="seo-content-block">
      <h2 className="scb-title">{title}</h2>
      <div className="scb-body">
        {children}
      </div>
    </div>
  );
}
