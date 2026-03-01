import React, { useEffect, useRef } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import './ToolShell.css';

/* ─── Google AdSense Banner ─────────────────────────────── */
export function AdBanner({ slot }) {
  const ref = useRef(null);
  const fired = useRef(false);

  // HIDE ADS while site is new / during placeholder phase
  // eslint-disable-next-line no-self-compare
  const isPlaceholder = "ca-pub-XXXXXXXXXXXXXXXX" === "ca-pub-XXXXXXXXXXXXXXXX";

  useEffect(() => {
    if (fired.current || !ref.current || isPlaceholder) return;
    fired.current = true;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { }
  }, [isPlaceholder]);

  // Don't render anything in production while we have a placeholder ID
  if (isPlaceholder && process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="ad-wrap">
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true" />
      {process.env.NODE_ENV === 'development' && (
        <div className="ad-placeholder">
          <span>📢 Google AdSense Slot (Hidden) · Slot: {slot}</span>
          <span>Update ID in ToolShell.jsx to enable.</span>
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
export function Control({ label, hint, children, id }) {
  return (
    <div className="control">
      {(label || hint) && (
        <div className="control-header">
          {label && <label htmlFor={id} className="control-label">{label}</label>}
          {hint && <span className="control-hint">{hint}</span>}
        </div>
      )}
      {id ? React.cloneElement(children, { id }) : children}
    </div>
  );
}

/* ─── Slider ─────────────────────────────────────────────── */
export function Slider({ min, max, step = 1, value, onChange, formatValue, id, label }) {
  const numVal = parseFloat(value) || 0;
  const numMin = parseFloat(min) || 0;
  const numMax = parseFloat(max) || 100;
  const pct = Math.max(0, Math.min(100, ((numVal - numMin) / (numMax - numMin)) * 100));

  return (
    <div className="slider-wrap">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={numVal}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="slider"
        aria-label={label}
        aria-valuemin={numMin}
        aria-valuemax={numMax}
        aria-valuenow={numVal}
        style={{
          background: `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)`
        }}
      />
      <span className="slider-val" aria-hidden="true">
        {formatValue ? formatValue(numVal) : numVal}
      </span>
    </div>
  );
}

/* ─── Select ─────────────────────────────────────────────── */
export function Select({ value, onChange, options, placeholder, id, label }) {
  return (
    <div className="select-wrap">
      <select
        id={id}
        value={String(value)}
        onChange={e => onChange(e.target.value)}
        className="select"
        aria-label={label}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o, i) =>
          typeof o === 'string'
            ? <option key={i} value={o}>{o}</option>
            : <option key={i} value={String(o.value)}>{o.label}</option>
        )}
      </select>
      <svg className="select-arrow" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* ─── Primary button ─────────────────────────────────────── */
export function Btn({ onClick, disabled, loading, children, variant = 'primary', full = true, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${full ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ─── Download link ──────────────────────────────────────── */
export function DownloadBtn({ href, filename, children, ...props }) {
  if (!href) return null;
  return (
    <a href={href} download={filename} className="btn btn-success btn-full btn-premium-download" {...props}>
      <Download size={18} strokeWidth={2.5} />
      {children}
    </a>
  );
}

/* ─── Ghost reset button ─────────────────────────────────── */
export function ResetBtn({ onClick }) {
  return (
    <button type="button" className="btn btn-ghost btn-full" onClick={onClick} aria-label="Start over">
      <RotateCcw size={16} />
      Start over
    </button>
  );
}

/* ─── Status bar ─────────────────────────────────────────── */
export function StatusBar({ status }) {
  if (!status) return null;
  const cls = { processing: 'status-processing', success: 'status-success', error: 'status-error', warning: 'status-warning' };
  const icon = { success: '✓', error: '✕', warning: '⚠' };

  return (
    <div
      className={`status-bar ${cls[status.type] || ''}`}
      role="status"
      aria-live={status.type === 'error' ? 'assertive' : 'polite'}
    >
      {status.type === 'processing'
        ? <span className="spinner" aria-hidden="true" />
        : <span className="status-icon" aria-hidden="true">{icon[status.type]}</span>}
      <span>{status.msg}</span>
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────── */
export function ProgressBar({ value, label = "Processing" }) {
  const safeVal = Math.min(100, Math.max(0, value));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={safeVal}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={label}
    >
      <div className="progress-fill" style={{ width: `${safeVal}%` }} />
    </div>
  );
}

/* ─── Preview box ────────────────────────────────────────── */
export function PreviewBox({ children, checkerboard = false, minHeight = 260, label }) {
  return (
    <div
      className={`preview-box ${checkerboard ? 'checker' : ''}`}
      style={{ minHeight }}
      aria-label={label || "Preview area"}
      role="region"
    >
      {children || (
        <div className="preview-empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1" opacity="0.25" aria-hidden="true">
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
    <div className="info-chips" role="list">
      {items.map((item, i) => (
        <div key={i} className="info-chip" role="listitem">
          <span className="chip-label">{item.label}</span>
          <span className="chip-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Target Size Control ────────────────────────────────── */
export function TargetSizeControl({ enabled, onToggle, value, onChange, id = "target-size-opt", min = 20, max = 10240, step = 10 }) {
  const safeMin = parseFloat(min) || 5;
  let safeMax = parseFloat(max) || 10240;
  if (safeMax < safeMin) safeMax = safeMin;

  const validValue = Math.max(safeMin, Math.min(safeMax, parseFloat(value) || safeMin));
  const formatKB = (v) => v < 1000 ? `${v} KB` : `${(v / 1024).toFixed(1)} MB`;

  return (
    <div className="target-size-control">
      <div className="checkbox-wrap" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onToggle(!enabled)}>
        <input
          id={`${id}-checkbox`}
          type="checkbox"
          checked={enabled}
          onChange={(e) => { e.stopPropagation(); onToggle(e.target.checked); }}
          aria-label="Enable target file size"
          style={{ cursor: 'pointer' }}
        />
        <label htmlFor={`${id}-checkbox`} style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
          Target File Size? (Smart Compression)
        </label>
      </div>

      {enabled && (
        <div className="target-size-inputs" style={{ marginTop: 20, paddingLeft: 8 }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Min: {formatKB(safeMin)}</span>
            <span>Max: {formatKB(safeMax)}</span>
          </div>
          <Slider
            id={id}
            min={safeMin}
            max={safeMax}
            step={step}
            value={validValue}
            onChange={onChange}
            formatValue={formatKB}
            label="Adjust target file size limit"
          />
          <div className="size-presets" style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {[100, 500, 2048, 5120].filter(bp => bp >= min && bp <= max).map(bp => (
              <button
                key={bp}
                type="button"
                className="preset-chip"
                onClick={() => onChange(bp)}
                style={{ fontSize: '0.72rem', padding: '5px 12px' }}
              >
                {formatKB(bp)}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--accent)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>Note:</strong> We prioritize maximum visual quality. If your result is much smaller than your target (e.g. 5KB when asking for 15KB), it means the image is already at 100% quality and cannot naturally be larger without adding fake bloat data.
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FAQ ────────────────────────────────────────────────── */
export function FAQ({ items }) {
  return (
    <section className="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {items.map((item, i) => (
          <article key={i} className="faq-item">
            <h3 className="faq-q">{item.q}</h3>
            <p className="faq-a">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
/* ─── SEO Content Block ───────────────────────────────────── */
export function SEOContent({ title, children }) {
  return (
    <section className="seo-content-block" aria-labelledby="seo-title">
      <h2 id="seo-title" className="scb-title">{title}</h2>
      <div className="scb-body">
        {children}
      </div>
    </section>
  );
}
