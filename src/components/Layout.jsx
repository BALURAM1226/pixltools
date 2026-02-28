import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { AdBanner } from './ToolShell';
import Fuse from 'fuse.js';
import {
  Home, RefreshCw, Shrink, Eraser, UserSquare, Maximize2,
  Code2, FileText, ScanText, QrCode, ChevronDown,
  Search, X, ArrowRight, Sun, Moon, Menu, Frown,
  ShieldCheck, Scale, FileCode, Key,
  Hash, Eye, Activity, Link2, Ruler, Lock
} from 'lucide-react';
import './Layout.css';

/* ── Nav items ──────────────────────────────────────────── */
const NAV = [
  { path: '/', label: 'Home', icon: <Home size={18} />, exact: true },
  { path: '/image-converter', label: 'Image Converter', icon: <RefreshCw size={18} />, badge: 'NEW', cat: 'image', color: '#63b3ed' },
  { path: '/image-compressor', label: 'Image Compressor', icon: <Shrink size={18} />, cat: 'image', color: '#68d391' },
  { path: '/background-remover', label: 'BG Remover', icon: <Eraser size={18} />, badge: 'AI', cat: 'image', color: '#f6ad55' },
  { path: '/passport-photo', label: 'Passport Photo', icon: <UserSquare size={18} />, cat: 'image', color: '#b794f4' },
  { path: '/image-resizer', label: 'Image Resizer', icon: <Maximize2 size={18} />, cat: 'image', color: '#4fd1c5' },
  { path: '/image-to-pdf', label: 'Image to PDF', icon: <FileText size={18} />, cat: 'pdf', color: '#f687b3' },
  { path: '/ocr', label: 'OCR Scanner', icon: <ScanText size={18} />, badge: 'HOT', cat: 'dev', color: '#ed64a6' },
  { path: '/base64-converter', label: 'Base64 Converter', icon: <Code2 size={18} />, cat: 'dev', color: '#a0aec0' },
  { path: '/json-formatter', label: 'JSON Formatter', icon: <FileCode size={18} />, cat: 'dev', color: '#4299e1' },
  { path: '/html-wcag-validator', label: 'HTML WCAG Scanner', icon: <Activity size={18} />, badge: 'NEW', cat: 'dev', color: '#f56565' },
  { path: '/color-contrast-checker', label: 'Color Contrast', icon: <Eye size={18} />, badge: 'NEW', cat: 'dev', color: '#9f7aea' },
  { path: '/secret-generator', label: 'Secret Key Gen', icon: <Key size={18} />, cat: 'dev', color: '#ed64a6' },
  { path: '/url-encoder-decoder', label: 'URL Encoder', icon: <Link2 size={18} />, badge: 'NEW', cat: 'dev', color: '#b794f4' },
  { path: '/css-unit-converter', label: 'Global CSS Units', icon: <Ruler size={18} />, badge: 'NEW', cat: 'dev', color: '#4fd1c5' },
  { path: '/jwt-debugger', label: 'JWT Debugger', icon: <Lock size={18} />, badge: 'NEW', cat: 'dev', color: '#63b3ed' },
  { path: '/diff-checker', label: 'Diff Checker', icon: <FileCode size={18} />, badge: 'NEW', cat: 'dev', color: '#f6ad55' },
  { path: '/qr-generator', label: 'QR Generator', icon: <QrCode size={18} />, badge: 'NEW', cat: 'utility', color: '#ed8936' },
  { path: '/password-generator', label: 'Password Gen', icon: <ShieldCheck size={18} />, cat: 'utility', color: '#48bb78' },
  { path: '/unit-converter', label: 'Unit Converter', icon: <Scale size={18} />, cat: 'utility', color: '#f6ad55' },
  { path: '/hashtag-generator', label: 'Hashtag Gen', icon: <Hash size={18} />, cat: 'social', color: '#319795' },
];

const NAV_CATEGORIES = [
  { id: 'image', label: 'Image Tools' },
  { id: 'pdf', label: 'PDF Tools' },
  { id: 'dev', label: 'Dev Tools' },
  { id: 'utility', label: 'Utilities' },
  { id: 'social', label: 'Social Media' },
];


/* ── Animated theme toggle button ───────────────────────── */
function ThemeToggle({ size = 'md' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      className={`theme-toggle theme-toggle--${size}`}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__track">
        <span className={`theme-toggle__thumb ${isDark ? 'thumb--dark' : 'thumb--light'}`}>
          {isDark ? <Moon size={12} fill="currentColor" /> : <Sun size={12} fill="currentColor" />}
        </span>
      </span>
      <span className="theme-toggle__label">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

/* ── Logo ───────────────────────────────────────────────── */
function Logo() {
  return (
    <Link to="/" className="logo">
      <div className="logo-mark">
        <svg viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="url(#lgg)" />
          <path d="M8 24L14 12l5 8 3-5 4 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.7)" />
          <defs>
            <linearGradient id="lgg" x1="0" y1="0" x2="32" y2="32">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="logo-text">iLoveTool<span>Hub</span></span>
    </Link>
  );
}

/* ── Search Component ───────────────────────────────────── */
function GlobalSearch({ tools }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  // navigate is available if needed for future click handlers
  // const navigate = useNavigate();

  // Initialize Fuse.js for fuzzy searching
  const fuse = useRef(new Fuse(tools, {
    keys: ['label', 'cat', 'desc'],
    threshold: 0.35,
    distance: 100,
    ignoreLocation: true
  }));

  const results = query.trim().length > 0
    ? fuse.current.search(query).map(r => r.item)
    : [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <div
        className={`search-input-wrapper ${isOpen ? 'focused' : ''}`}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <Search className="search-icon" size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            className="search-clear"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <div className="search-dropdown-scroll">
              {results.map(t => (
                <Link
                  key={t.path}
                  to={t.path}
                  className="search-list-item"
                  onClick={() => { setQuery(''); setIsOpen(false); }}
                  style={{ '--c': t.color || 'var(--accent)' }}
                >
                  <span className="search-list-icon">{t.icon}</span>
                  <div className="search-list-info">
                    <span className="search-list-label">{t.label}</span>
                    <span className="search-list-cat-pill">{t.cat?.split('-')[0].toUpperCase()}</span>
                  </div>
                  <div className="search-list-arrow">
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="search-no-results">
              <Frown size={32} strokeWidth={1.5} />
              <p>No tools found matching "<span>{query}</span>"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Category Dropdown ─────────────────────────────────── */
function CatDropdown({ category, tools }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150); // 150ms "stickiness"
  };

  return (
    <div
      className="cat-dropdown-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className={`cat-dropdown-trigger ${open ? 'active' : ''}`}>
        {category.label}
        <ChevronDown size={14} className="dropdown-arrow" />
      </button>

      {open && (
        <div
          className="cat-dropdown-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="cat-dropdown-grid">
            {tools.map(tool => (
              <Link
                key={tool.path}
                to={tool.path}
                className="cat-dropdown-item"
                onClick={() => setOpen(false)}
                style={{ '--c': tool.color || 'var(--accent)' }}
              >
                <span className="cat-tool-icon">{tool.icon}</span>
                <div className="cat-tool-info">
                  <span className="cat-tool-label">{tool.label} {tool.badge && <span className="cat-tool-badge">{tool.badge}</span>}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Layout ─────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="layout">
      {/* Skip to Content for Screen Readers/Keyboard users */}
      <a href="#main-content" className="skip-to-content">Skip to Main Content</a>

      {/* ── Header ── */}
      <header className="header" role="banner">
        <div className="header-left">
          <button
            className="burger"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
          >
            <Menu size={24} />
          </button>
          <Logo />
        </div>

        <nav className="header-nav" aria-label="Primary navigation">
          <NavLink to="/" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>

          <div className="header-nav-main">
            {NAV_CATEGORIES.map(cat => (
              <CatDropdown
                key={cat.id}
                category={cat}
                tools={NAV.filter(t => t.cat === cat.id)}
              />
            ))}
          </div>
        </nav>

        <div className="header-right">
          <GlobalSearch tools={NAV.filter(n => n.cat)} />
          <ThemeToggle size="md" />
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo />
          <button className="burger sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon"><Home size={18} /></span>
            <span className="sidebar-label">Home</span>
          </NavLink>

          {NAV_CATEGORIES.map(category => (
            <div key={category.id} className="sidebar-group">
              <p className="sidebar-section-label">{category.label}</p>
              {NAV.filter(item => item.cat === category.id).map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Theme toggle inside sidebar */}
          <div className="sidebar-theme-row">
            <span className="sidebar-theme-label">Appearance</span>
            <ThemeToggle size="lg" />
          </div>

          <div className="privacy-badge">
            <span>🔒</span>
            <div>
              <strong>100% Private</strong>
              <p>Your images never leave your device</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content" id="main-content" tabIndex="-1">
        <div className="layout-horizontal">
          {/* ── Left Ad Sidebar (Desktop) ── */}
          <aside className="side-ad left-ad">
            <AdBanner slot="LEFT_SIDEBAR_AD" />
          </aside>

          <div className="page-container">
            {children}
          </div>

          {/* Spacer for symmetry or potential right ad */}
          <aside className="side-ad-spacer" />
        </div>

        {/* ── Global Footer ── */}
        <footer className="global-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-copy">© 2026 iLoveToolHub</span>
              <span className="footer-divider" />

              {/* Conditional AGPL Link - only on tools using @imgly */}
              {(pathname === '/background-remover' || pathname === '/passport-photo') ? (
                <a href="https://github.com/BALURAM1226/iLoveToolHub" target="_blank" rel="noopener noreferrer" className="footer-link-git" title="View Source Code">
                  <span>Open Source • Powered by imgly</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              ) : (
                <span className="footer-status">Safe & Browser-Local</span>
              )}
            </div>

            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/disclaimer">Disclaimer</Link>
            </div>

            <div className="footer-right">
              <span className="footer-trust">Privacy First • No Uploads</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
