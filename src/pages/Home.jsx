import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import MagicHero from '../components/MagicHero';
import './Home.css';

const CATEGORIES = [
  {
    id: 'image-tools',
    title: 'Image Tools',
    icon: '🖼️',
    tools: [
      {
        path: '/image-converter',
        icon: '🔄',
        title: 'Image Converter',
        desc: 'Convert between JPG, PNG, WEBP, SVG, GIF, BMP, TIFF, ICO — any format to any format.',
        tags: ['PNG → JPG', 'SVG → PNG', 'WEBP → JPG', 'Format Converter', 'Batch Convert'],
        color: '#63b3ed',
        badge: 'NEW',
      },
      {
        path: '/image-compressor',
        icon: '🗜️',
        title: 'Image Compressor',
        desc: 'Reduce image file size up to 90% without visible quality loss. Supports batch files.',
        tags: ['Smart Compress', 'JPG/PNG/WEBP', 'Reduce Size', 'Optimize Images', 'No Quality Loss'],
        color: '#68d391',
      },
      {
        path: '/background-remover',
        icon: '✂️',
        title: 'BG Remover',
        desc: 'AI-powered background removal. Get transparent PNG or replace with any color.',
        tags: ['AI-powered', 'Transparent PNG', 'Edit Background', 'Object Removal', 'Product Photo'],
        color: '#f6ad55',
        badge: 'AI',
      },
      {
        path: '/passport-photo',
        icon: '🪪',
        title: 'Passport Photo',
        desc: 'Convert to official passport size for US, UK, India, EU, China and more.',
        tags: ['2×2 in', '35×45 mm', 'ID Photo', 'Visa Photo', 'Official Forms', 'Print Ready'],
        color: '#b794f4',
      },
      {
        path: '/image-resizer',
        icon: '📏',
        title: 'Image Resizer',
        desc: 'Resize images for Instagram, YouTube, LinkedIn or custom dimensions.',
        tags: ['Social Presets', 'Custom Resize', 'Crop Image', 'Aspect Ratio', 'Bulk Resize'],
        color: '#4fd1c5',
      },
    ]
  },
  {
    id: 'pdf-tools',
    title: 'PDF Tools',
    icon: '📄',
    tools: [
      {
        path: '/image-to-pdf',
        icon: '📄',
        title: 'Image to PDF',
        desc: 'Combine multiple images into a single PDF. Choose page size and orientation.',
        tags: ['Multi-page', 'A4/Letter', 'Reorder', 'JPG to PDF', 'PDF Creator'],
        color: '#f687b3',
      },
      {
        path: '/pdf-merge',
        icon: '📚',
        title: 'PDF Merge',
        desc: 'Join two or more PDF files into a single document. Reorder pages instantly.',
        tags: ['Combine PDF', 'Join Documents', 'No Data Loss', 'Fast Merge', 'Secure'],
        color: '#f56565',
        badge: 'NEW',
      },
      {
        path: '/pdf-splitter',
        icon: '✂️',
        title: 'PDF Splitter',
        desc: 'Extract specific pages or ranges from your PDF into a brand new document instantly.',
        tags: ['Extract Pages', 'Cut PDF', 'Page Range', 'Professional', 'Secure'],
        color: '#48bb78',
        badge: 'NEW',
      },
      {
        path: '/pdf-to-image',
        icon: '🖼️',
        title: 'PDF to Image',
        desc: 'Convert PDF pages into high-quality JPG or PNG images. DPI adjustment supported.',
        tags: ['PDF to JPG', 'PDF to PNG', 'High Res Rendering', 'Batch Export', 'SECURE'],
        color: '#63b3ed',
        badge: 'NEW',
      },
      {
        path: '/pdf-compress',
        icon: '🗜️',
        title: 'PDF Compressor',
        desc: 'Reduce PDF file size without losing text quality. Optimized for web and email sharing.',
        tags: ['Shrink PDF', 'Reduce Size', 'Optimization', 'No Re-Upload', 'Secure'],
        color: '#38b2ac',
        badge: 'NEW',
      },
      {
        path: '/pdf-organize',
        icon: '🗂️',
        title: 'PDF Organizer',
        desc: 'Visually rearrange, extract, and rotate pages with full drag-and-drop support.',
        tags: ['Rearrange PDF', 'Move Pages', 'Drag and Drop', 'Rotate PDF', 'Extract'],
        color: '#4fd1c5',
        badge: 'NEW',
      },
      {
        path: '/html-to-pdf',
        icon: '🌐',
        title: 'HTML to PDF',
        desc: 'Convert any raw HTML and CSS code instantly into a perfectly rendered PDF document.',
        tags: ['Save as PDF', 'Code to Document', 'Print HTML', 'Web Snapshot'],
        color: '#ff7043',
        badge: 'NEW',
      },
      {
        path: '/pdf-remove-pages',
        icon: '🗑️',
        title: 'Remove PDF Pages',
        desc: 'Delete unwanted pages from your document visually. Secure and completely local.',
        tags: ['Delete Pages', 'Clean PDF', 'Remove Sections', 'Extract'],
        color: '#f56565',
        badge: 'NEW',
      },
      {
        path: '/pdf-protect',
        icon: '🔒',
        title: 'Protect PDF',
        desc: 'Lock your sensitive PDFs with an AES encrypted password. 100% locally in your browser.',
        tags: ['Add Password', 'Encrypt PDF', 'Secure Document', 'Lock PDF'],
        color: '#48bb78',
        badge: 'NEW',
      },
      {
        path: '/pdf-page-numbers',
        icon: '🔢',
        title: 'Add Page Numbers',
        desc: 'Insert page numbers into PDFs locally. Choose positions and formats like "Page 1 of 5".',
        tags: ['Pagination', 'Stamp Numbers', 'Format PDF', '100% Local'],
        color: '#805ad5',
        badge: 'NEW',
      },
      {
        path: '/pdf-watermark',
        icon: '💧',
        title: 'Watermark PDF',
        desc: 'Stamp text watermarks across all PDF pages. Choose position, rotation, and opacity.',
        tags: ['Stamp PDF', 'Brand Document', 'Add Text', '100% Local'],
        color: '#38b2ac',
        badge: 'NEW',
      },
      {
        path: '/pdf-sign',
        icon: '✍️',
        title: 'Sign PDF',
        desc: 'Draw your signature and stamp it on PDF documents purely in your browser. 100% Secure.',
        tags: ['E-Sign', 'Draw Signature', 'Digital Sign', 'No Upload'],
        color: '#e53e3e',
        badge: 'NEW',
      },
    ]
  },
  {
    id: 'dev-tools',
    title: 'Dev Tools',
    icon: '💻',
    tools: [
      {
        path: '/ocr',
        icon: '🔍',
        title: 'Smart OCR Scanner',
        desc: 'Extract text from images & scanned PDFs instantly. 100% private and accurate.',
        tags: ['Image to Text', 'Scanned PDF', 'No Upload', 'OCR Tool', 'Document Scanner'],
        color: '#ed64a6',
        badge: 'HOT',
      },
      {
        path: '/base64-converter',
        icon: '🔡',
        title: 'Base64 Converter',
        desc: 'Encode images to Base64 strings or decode back. Perfect for developers.',
        tags: ['Dev Tool', 'Data URIs', 'Image to Text', 'Base64 Encode', 'Base64 Decode'],
        color: '#a0aec0',
      },
      {
        path: '/json-formatter',
        icon: '📜',
        title: 'JSON Formatter',
        desc: 'Beautify, validate, and minify your JSON data with ease.',
        tags: ['Validate', 'Beautify', 'Minify', 'JSON Editor', 'Prettify JSON'],
        color: '#4299e1',
      },
      {
        path: '/html-wcag-validator',
        icon: '♿',
        title: 'HTML WCAG Scanner',
        desc: 'Paste React, NextJS, or HTML code to instantly find accessibility errors.',
        tags: ['DOM Audit', 'HTML WCAG Validator', 'A11y Check', 'Accessibility Scanner', 'WCAG 2.1'],
        color: '#f56565',
        badge: 'NEW',
      },
      {
        path: '/color-contrast-checker',
        icon: '👁️',
        title: 'Color Contrast',
        desc: 'Verify color contrast pairs against WCAG AA and AAA accessibility standards.',
        tags: ['WCAG', 'Accessibility', 'Color Ratio', 'AA/AAA Standards', 'UI Design', 'Color Contrast Checker'],
        color: '#9f7aea',
        badge: 'NEW',
      },
      {
        path: '/secret-generator',
        icon: '🔑',
        title: 'Secret Key Expert',
        desc: 'Generate high-entropy keys for JWT, Auth, and Encryption.',
        tags: ['JWT Ready', 'HEX/Base64', 'High Entropy', 'Encryption Key', 'Auth Secret'],
        color: '#ed64a6',
      },
      {
        path: '/url-encoder-decoder',
        icon: '🔗',
        title: 'URL Encoder',
        desc: 'Safely encode or decode URL parameters and special characters.',
        tags: ['Dev Tool', 'Safe URL', 'Percent Encoding', 'Decode URL', 'Sanitize URL'],
        color: '#b794f4',
        badge: 'NEW',
      },
      {
        path: '/css-unit-converter',
        icon: '📐',
        title: 'Global CSS Units',
        desc: 'Convert seamlessly between PX, REM, EM, %, PT, VW and VH with custom root bases.',
        tags: ['CSS Helper', 'Responsive', 'PX to REM', 'Web Design', 'Fluid Typography'],
        color: '#4fd1c5',
        badge: 'NEW',
      },
      {
        path: '/jwt-debugger',
        icon: '🔐',
        title: 'JWT Debugger',
        desc: 'Decode and inspect JSON Web Tokens locally without sending them to any server.',
        tags: ['Security', 'Auth Tool', 'Decode JWT', 'Inspect Token', 'Local Processing'],
        color: '#63b3ed',
        badge: 'NEW',
      },
      {
        path: '/diff-checker',
        icon: '📂',
        title: 'Diff Checker',
        desc: 'Compare two text blocks to find and highlight line-by-line or word-by-word differences.',
        tags: ['Code Review', 'Compare Text', 'Diff Tool', 'MIT Licensed'],
        color: '#f6ad55',
        badge: 'NEW',
      },
    ]
  },
  {
    id: 'other-tools',
    title: 'Utilities',
    icon: '🛠️',
    tools: [
      {
        path: '/qr-generator',
        icon: '📱',
        title: 'QR Code Expert',
        desc: 'Generate professional QR codes with custom colors and logos for print.',
        tags: ['Custom Colors', 'Add Logo', 'Print Ready', 'Dynamic QR', 'Social Link QR'],
        color: '#ed8936',
        badge: 'NEW',
      },
      {
        path: '/password-generator',
        icon: '🔐',
        title: 'Password Generator',
        desc: 'Create ultra-secure, random passwords with custom settings.',
        tags: ['Custom Length', 'High Entropy', 'Secure Password', 'Random Gen', 'No Logs'],
        color: '#48bb78',
      },
      {
        path: '/unit-converter',
        icon: '⚖️',
        title: 'Unit Converter',
        desc: 'Convert Length, Weight, and Temp units instantly.',
        tags: ['Precise', 'Fast', 'Metric/Imperial', 'Distance/Weight', 'Converter'],
        color: '#f6ad55',
      },
    ]
  },
  {
    id: 'social-tools',
    title: 'Social Media',
    icon: '💬',
    tools: [
      {
        path: '/hashtag-generator',
        icon: '🏷️',
        title: 'Hashtag Generator',
        desc: 'Generate viral hashtags to boost your social media reach.',
        tags: ['Trending', 'Viral', 'IG Tags', 'TikTok SEO', 'Social Growth'],
        color: '#38b2ac',
      }
    ]
  }
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
        title="iLoveToolHub – Free Online Utility Toolkit | Compress & Convert Images Private"
        description="ilovetoolhub.com is a free online toolkit offering powerful image and PDF tools, including conversion, compression, background removal (BG Remover), editing, OCR scanner, and other utility features. No signup required, easy to use, and accessible from any device."
        keywords="ilove tool hub, bg remover online, ocr scanner free, compress image online free, image to pdf converter, resize for official forms, passport photo maker, global image tools"
        canonicalPath="/"
        customSchema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "iLoveToolHub",
          "url": "https://ilovetoolhub.com",
          "description": "ilovetoolhub.com is a free online toolkit offering powerful image and PDF tools, including conversion, compression, background removal (BG Remover), editing, OCR scanner, and other utility features. No signup required, easy to use, and accessible from any device.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": CATEGORIES.flatMap(cat => cat.tools).map((t, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "item": {
                "@type": "WebApplication",
                "name": t.title,
                "url": `https://ilovetoolhub.com${t.path}`,
                "description": t.desc,
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "All"
              }
            }))
          }
        }}
      />
      <div className="home">

        {/* Hero */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="eyebrow-dot" />
                The Ultimate Online Tool Hub
              </div>
              <h1 className="hero-title">
                Instant Productivity Tools<br />
                <span className="hero-gradient">Fast & Private</span>
              </h1>
              <p className="hero-sub">
                Compress images to 50KB, convert JPG to PDF, resize for official applications, and remove backgrounds — all 100% in your browser. Fast, free, and private.
              </p>
              <div className="hero-actions">
                <Link to="/image-converter" className="cta-primary">
                  Start Converting
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                </Link>
                <Link to="/background-remover" className="cta-secondary">Remove Background →</Link>
              </div>
              <div className="hero-stats">
                {[['100%', 'Free'], ['0', 'Uploads'], ['24+', 'Tools'], ['Private', 'Processing']].map(([val, label]) => (

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

        {/* Tools Section */}
        <section className="tools-section">
          {CATEGORIES.map(category => (
            <div key={category.id} className="category-group" id={category.id}>
              <div className="section-head">
                <h2 className="section-title">
                  <span className="section-title-icon">{category.icon}</span>
                  {category.title}
                </h2>
                <div className="title-underline" />
              </div>

              <div className="tools-grid">
                {category.tools.map(t => (
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
            </div>
          ))}
        </section>

        {/* Why Section */}
        <section className="why-section">
          <div className="section-head">
            <h2 className="section-title">Why iLoveToolHub?</h2>
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
          <h2>All-in-One Free Online Utility & Image Hub</h2>
          <p>iLoveToolHub is the premier free online suite for all your digital utility needs. Whether you are looking to convert image formats, combine multiple images into a PDF, extract text using high-accuracy OCR, or generate official passport photos—every single tool runs directly in your web browser.</p>
          <p>We believe in privacy and performance. By using advanced client-side processing, iLoveToolHub ensures that your files never leave your device. It’s fast, secure, and completely free to use without any signup or watermarks.</p>
        </section>

      </div>
    </>
  );
}
