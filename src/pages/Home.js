import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import MagicHero from '../components/MagicHero';
import './Home.css';

const TOOLS = [
  {
    path: '/image-converter',
    icon: '🔄',
    title: 'Image Converter',
    desc: 'Convert between JPG, PNG, WEBP, SVG, GIF, BMP, TIFF, ICO — any format to any format.',
    tags: ['PNG → JPG', 'SVG → PNG', 'WEBP → JPG', '+20 formats'],
    color: '#63b3ed',
    badge: 'NEW',
  },
  {
    path: '/passport-photo',
    icon: '🪪',
    title: 'Passport Photo',
    desc: 'Convert to official passport size for US, UK, India, EU, China, Schengen and more.',
    tags: ['2×2 inch', '35×45 mm', '7 formats'],
    color: '#b794f4',
  },
  {
    path: '/image-to-pdf',
    icon: '📄',
    title: 'Image to PDF',
    desc: 'Combine multiple images into a single PDF. Choose page size, orientation and margins.',
    tags: ['Multi-page', 'A4/Letter', 'Reorder pages'],
    color: '#f687b3',
  },
  {
    path: '/image-compressor',
    icon: '🗜️',
    title: 'Image Compressor',
    desc: 'Reduce image file size up to 90% without visible quality loss. Supports batch files.',
    tags: ['Up to 90% off', 'JPG/PNG/WEBP', 'Batch mode'],
    color: '#68d391',
  },
  {
    path: '/background-remover',
    icon: '✂️',
    title: 'BG Remover',
    desc: 'AI-powered background removal. Get transparent PNG or replace with any color.',
    tags: ['AI-powered', 'Transparent PNG', 'Custom BG'],
    color: '#f6ad55',
    badge: 'AI',
  },
  {
    path: '/image-resizer',
    icon: '📏',
    title: 'Image Resizer',
    desc: 'Resize images for Instagram, YouTube, LinkedIn or custom dimensions with quality control.',
    tags: ['Social Presets', 'Custom Resize', 'WebP/PNG/JPG'],
    color: '#4fd1c5',
  },
  {
    path: '/base64-converter',
    icon: '🔡',
    title: 'Base64 Converter',
    desc: 'Encode images to Base64 strings or decode them back. Perfect for developer integration.',
    tags: ['Dev Tool', 'Real-time', 'Data URIs'],
    color: '#a0aec0',
    tags: ['Dev Tool', 'Real-time', 'Data URIs'],
  },
  {
    path: '/ocr',
    icon: '🔍',
    title: 'OCR Scanner',
    desc: 'Extract text from images, documents, and receipts instantly. 100% private and accurate.',
    tags: ['Image to Text', 'Document Scan', 'PNG/JPG/SVG'],
    color: '#ed64a6',
    badge: 'HOT',
  },
];

const WHY = [
  { icon: '🔒', title: 'Browser-Only Processing', desc: 'Your images are never uploaded to any server. All work happens locally.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'WebAssembly-powered tools deliver results in seconds.' },
  { icon: '🆓', title: 'Completely Free', desc: 'No subscriptions, no watermarks, no hidden limits.' },
  { icon: '📱', title: 'Works on Any Device', desc: 'Fully responsive on mobile, tablet, and desktop.' },
  { icon: '🎯', title: 'High Accuracy', desc: 'AI models and precise algorithms give professional-grade output.' },
  { icon: '🛠️', title: 'No Installation', desc: 'Open your browser and start — nothing to download or install.' },
];

export default function Home() {
  return (
    <>
      <SEO
        title="PixlTools – Free Online Image Tools | Convert, Compress, Edit"
        description="Free online image tools: convert PNG to JPG, SVG to PNG, image to PDF, compress images, remove backgrounds. No signup. All processing in your browser."
        canonicalPath="/"
      />
      <div className="home">

        {/* Hero */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="eyebrow-dot" />
                Free Online Image Tools
              </div>
              <h1 className="hero-title">
                Transform Images<br />
                <span className="hero-gradient">Instantly & Free</span>
              </h1>
              <p className="hero-sub">
                Convert formats, compress, create passport photos, build PDFs, remove backgrounds — all in your browser. Zero uploads. Zero cost.
              </p>
              <div className="hero-actions">
                <Link to="/image-converter" className="cta-primary">
                  Start Converting
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                </Link>
                <Link to="/background-remover" className="cta-secondary">Remove Background →</Link>
              </div>
              <div className="hero-stats">
                {[['100%', 'Free'], ['0', 'Uploads'], ['8', 'Tools'], ['Private', 'Processing']].map(([val, label]) => (
                  <div key={label} className="hero-stat">
                    <span className="hs-val">{val}</span>
                    <span className="hs-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <MagicHero />
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="tools-section">
          <div className="section-head">
            <h2 className="section-title">All Tools</h2>
            <p className="section-sub">Click any tool to get started — no signup required</p>
          </div>
          <div className="tools-grid">
            {TOOLS.map(t => (
              <Link key={t.path} to={t.path} className="tool-card" style={{ '--c': t.color }}>
                <div className="tc-top">
                  <div className="tc-icon">{t.icon}</div>
                  {t.badge && <span className="tc-badge">{t.badge}</span>}
                </div>
                <h3 className="tc-title">{t.title}</h3>
                <p className="tc-desc">{t.desc}</p>
                <div className="tc-tags">
                  {t.tags.map(tag => <span key={tag} className="tc-tag">{tag}</span>)}
                </div>
                <div className="tc-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Why Section */}
        <section className="why-section">
          <div className="section-head">
            <h2 className="section-title">Why PixlTools?</h2>
          </div>
          <div className="why-grid">
            {WHY.map(w => (
              <div key={w.title} className="why-card">
                <span className="why-icon">{w.icon}</span>
                <h3 className="why-title">{w.title}</h3>
                <p className="why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO content */}
        <section className="seo-block">
          <h2>Free Online Image Conversion & Editing Tools</h2>
          <p>PixlTools is a free suite of browser-based image utilities. Whether you need to convert a PNG to JPG, an SVG to PNG, compress images for your website, generate passport photos for a visa application, combine images into a PDF document, or remove backgrounds from product photos — every tool works directly in your browser with no server uploads.</p>
          <p>All tools are built using modern web technologies including the Canvas API, WebAssembly, and AI models that run locally. Your files stay private on your device at all times.</p>
        </section>

      </div>
    </>
  );
}
