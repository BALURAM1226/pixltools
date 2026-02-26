import React, { useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { AdBanner } from './ToolShell';
import './Layout.css';

/* ── Nav items ──────────────────────────────────────────── */
const NAV = [
  { path: '/', label: 'Home', icon: <HomeIcon />, exact: true },
  { path: '/image-converter', label: 'Image Converter', icon: <ConvertIcon />, badge: 'NEW' },
  { path: '/passport-photo', label: 'Passport Photo', icon: <PassportIcon /> },
  { path: '/image-to-pdf', label: 'Image to PDF', icon: <PdfIcon /> },
  { path: '/image-compressor', label: 'Image Compressor', icon: <CompressIcon /> },
  { path: '/background-remover', label: 'BG Remover', icon: <BgIcon />, badge: 'AI' },
  { path: '/image-resizer', label: 'Image Resizer', icon: <ResizeIcon /> },
  { path: '/base64-converter', label: 'Base64 Converter', icon: <B64Icon /> },
  { path: '/ocr', label: 'OCR Scanner', icon: <ScanIcon />, badge: 'HOT' },
];

/* ── SVG Icons ──────────────────────────────────────────── */
function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function ConvertIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>;
}
function PassportIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M6 21v-1a6 6 0 0112 0v1" /></svg>;
}
function PdfIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>;
}
function CompressIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="10" y1="14" x2="21" y2="3" /><line x1="3" y1="21" x2="14" y2="10" /></svg>;
}
function BgIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>;
}
function ResizeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5-5 5 5" /><path d="M7 14l5 5 5-5" /><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
}
function B64Icon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
}
function ScanIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 012-2h2" /><path d="M17 3h2a2 2 0 012 2v2" /><path d="M21 17v2a2 2 0 01-2 2h-2" /><path d="M7 21H5a2 2 0 01-2-2v-2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="13" y2="16" /></svg>;
}
function MenuIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}

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
          {isDark
            ? /* Moon */
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            : /* Sun */
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          }
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

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <button className="burger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            <MenuIcon open={sidebarOpen} />
          </button>
          <Logo />
        </div>

        <nav className="header-nav">
          {NAV.slice(1).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="header-right">
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
            <MenuIcon open={true} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Tools</p>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
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
      <main className="main-content">
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

            <div className="footer-right">
              <span className="footer-trust">Privacy First • No Uploads</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
