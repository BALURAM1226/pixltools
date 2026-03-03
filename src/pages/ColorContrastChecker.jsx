import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Control, InfoChips, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import './ColorContrastChecker.css';

// Math for converting HEX to relative luminance
function getRGB(c) {
    let hex = c.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
    try {
        const c1 = getRGB(hex1);
        const c2 = getRGB(hex2);
        const l1 = getLuminance(c1.r, c1.g, c1.b);
        const l2 = getLuminance(c2.r, c2.g, c2.b);

        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);

        const ratio = (lighter + 0.05) / (darker + 0.05);
        return Math.round(ratio * 100) / 100;
    } catch (e) {
        return 1;
    }
}

function hexValid(hex) {
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
}

function ensureHash(val) {
    if (!val.startsWith('#')) return '#' + val;
    return val;
}

export default function ColorContrastChecker() {
    const [fg, setFg] = useState('#2563EB'); // default accent blue
    const [bg, setBg] = useState('#FFFFFF'); // default white
    const [ratio, setRatio] = useState(1);

    // Real-time calculation effect
    useEffect(() => {
        if (hexValid(fg) && hexValid(bg)) {
            setRatio(getContrastRatio(fg, bg));
        }
    }, [fg, bg]);

    const handleFgChange = (e) => setFg(ensureHash(e.target.value));
    const handleBgChange = (e) => setBg(ensureHash(e.target.value));

    const swapColors = () => {
        const temp = fg;
        setFg(bg);
        setBg(temp);
    };

    const getStatus = (ratio, target) => {
        return ratio >= target ? 'Pass' : 'Fail';
    };

    const statusClass = (status) => status === 'Pass' ? 'status-pass' : 'status-fail';

    return (
        <div className="contrast-page">
            <SEO
                title="WCAG Color Contrast Checker Online – Free Accessibility Tool"
                description="Verify color contrast instantly for WCAG AA and AAA compliance. Ensure your website text, logos, and UI are accessible to everyone. 100% Free."
                keywords="color contrast checker, wcag checker, wcag aa aaa compliance, text contrast ratio, accessible colors, ui accessibility tool"
                canonicalPath="/color-contrast-checker"
            />

            <ToolHeader
                title="Color Contrast"
                highlight="Checker"
                badge="👁️ WCAG Compliant"
                desc="Check the contrast ratio between text and background colors instantly. Ensure your designs meet WCAG 2.1 AA and AAA standards for perfect readability."
            />

            <ToolGrid>
                {/* ── Left: Settings ── */}
                <Panel title="Step 1: Pick Colors">
                    <div className="color-inputs-container">

                        <div className="color-input-group">
                            <div className="color-header">
                                <span className="color-label">Foreground (Text) Color</span>
                            </div>
                            <div className="color-picker-wrap">
                                <input
                                    type="color"
                                    value={hexValid(fg) ? fg : '#000000'}
                                    onChange={handleFgChange}
                                    className="color-swatch"
                                    aria-label="Foreground color picker"
                                />
                                <input
                                    type="text"
                                    value={fg}
                                    onChange={handleFgChange}
                                    className="hex-input"
                                    placeholder="#000000"
                                    aria-label="Foreground hex code"
                                />
                            </div>
                        </div>

                        <div className="swap-btn-container">
                            <button className="swap-btn" onClick={swapColors} aria-label="Swap foreground and background colors">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                                    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                                </svg>
                            </button>
                        </div>

                        <div className="color-input-group">
                            <div className="color-header">
                                <span className="color-label">Background Color</span>
                            </div>
                            <div className="color-picker-wrap">
                                <input
                                    type="color"
                                    value={hexValid(bg) ? bg : '#ffffff'}
                                    onChange={handleBgChange}
                                    className="color-swatch"
                                    aria-label="Background color picker"
                                />
                                <input
                                    type="text"
                                    value={bg}
                                    onChange={handleBgChange}
                                    className="hex-input"
                                    placeholder="#ffffff"
                                    aria-label="Background hex code"
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <InfoChips items={[
                                { label: 'Minimum AA Ratio', value: '4.5:1' },
                                { label: 'Maximum Contrast', value: '21:1' },
                            ]} />
                        </div>

                    </div>
                </Panel>

                {/* ── Right: Results & Preview ── */}
                <Panel title="Step 2: Contrast Results">

                    <div className="contrast-score-wrap">
                        <span className="ratio-value" style={{ color: ratio >= 4.5 ? 'var(--green)' : 'var(--red)' }}>
                            {ratio.toFixed(2)} : 1
                        </span>
                        <span className="ratio-label">Contrast Ratio</span>
                    </div>

                    <div className="wcag-cards">
                        <div className="wcag-card">
                            <div className="wcag-card-header">
                                <span className="wcag-title">Normal Text (WCAG AA)</span>
                                <span className={`wcag-status ${statusClass(getStatus(ratio, 4.5))}`}>{getStatus(ratio, 4.5)}</span>
                            </div>
                            <span className="wcag-desc">Requires a contrast ratio of at least 4.5:1 for body and paragraph text.</span>
                        </div>

                        <div className="wcag-card">
                            <div className="wcag-card-header">
                                <span className="wcag-title">Large Text (WCAG AA)</span>
                                <span className={`wcag-status ${statusClass(getStatus(ratio, 3.0))}`}>{getStatus(ratio, 3.0)}</span>
                            </div>
                            <span className="wcag-desc">Requires a contrast ratio of at least 3.0:1 for text that is 18pt or 14pt bold.</span>
                        </div>

                        <div className="wcag-card">
                            <div className="wcag-card-header">
                                <span className="wcag-title">Normal Text (WCAG AAA)</span>
                                <span className={`wcag-status ${statusClass(getStatus(ratio, 7.0))}`}>{getStatus(ratio, 7.0)}</span>
                            </div>
                            <span className="wcag-desc">Requires a contrast ratio of at least 7.0:1. The gold standard for accessibility.</span>
                        </div>

                        <div className="wcag-card">
                            <div className="wcag-card-header">
                                <span className="wcag-title">UI Components & Graphics</span>
                                <span className={`wcag-status ${statusClass(getStatus(ratio, 3.0))}`}>{getStatus(ratio, 3.0)}</span>
                            </div>
                            <span className="wcag-desc">Requires 3.0:1 for icons, buttons, input borders, and other graphical identifiers.</span>
                        </div>
                    </div>

                    <Control label="Live Preview Simulation">
                        <div
                            className="live-preview"
                            style={{
                                backgroundColor: hexValid(bg) ? bg : '#ffffff',
                                color: hexValid(fg) ? fg : '#000000',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <h2 className="preview-title">Accessibility matters.</h2>
                            <p className="preview-text">
                                This is a live preview of how your text will look to users on this exact background.
                                Proper color contrast helps people with visual impairments, color blindness, and even
                                average users reading their screens in harsh sunlight.
                            </p>
                        </div>
                    </Control>

                </Panel>
            </ToolGrid>

            <AdBanner slot="8888888888" />

            <SEOContent title="Why Color Contrast Matters for Accessible Web Design">
                <p>Providing sufficient color contrast is not just a best practice—it is a critical requirement under the Web Content Accessibility Guidelines (WCAG) and often legally mandated by the Americans with Disabilities Act (ADA) for business websites.</p>

                <div className="related-tool-cta">
                    <div className="cta-content">
                        <h4>🔍 Need a deeper audit?</h4>
                        <p>Our <strong>HTML WCAG Validator</strong> scans your entire code snippet for missing alt tags, aria-labels, and other critical accessibility issues.</p>
                    </div>
                    <a href="/html-wcag-validator" className="cta-link-btn">
                        Open WCAG Validator
                    </a>
                </div>

                <h3>Understanding the Contrast Ratio</h3>
                <p>Contrast ratios range from <strong>1:1 (no contrast, e.g., white on white)</strong> to <strong>21:1 (maximum contrast, e.g., black on white)</strong>. Checking this ratio ensures that your written content can be clearly distinguished from its background by all demographics, including the aging population and the estimated 8% of males with color vision deficiency.</p>

                <h3>WCAG 2.1 Guidelines Explained</h3>
                <p>The W3C defines three levels of conformance. For most public-facing websites, reaching <strong>Level AA</strong> is the standard requirement.</p>
                <ul>
                    <li><strong>1.4.3 Contrast (Minimum) - Level AA:</strong> The visual presentation of text and images of text has a contrast ratio of at least <strong>4.5:1</strong>. Large-scale text (18pt+) requires <strong>3:1</strong>.</li>
                    <li><strong>1.4.6 Contrast (Enhanced) - Level AAA:</strong> This is the higher "gold standard." It requires a contrast ratio of <strong>7:1</strong> for normal text and <strong>4.5:1</strong> for large-scale text.</li>
                    <li><strong>1.4.11 Non-text Contrast - Level AA:</strong> This covers UI components like buttons, input borders, and checkboxes, requiring a ratio of at least <strong>3:1</strong> against adjacent colors.</li>
                </ul>

                <h3>Professional Best Practices for Developers</h3>
                <div className="best-practices-grid">
                    <div className="practice-card">
                        <h5>Never Use Color Alone</h5>
                        <p>Don't rely solely on color to convey information (e.g., a red border for an error). Always include text or icons as secondary indicators.</p>
                    </div>
                    <div className="practice-card">
                        <h5>Check State Changes</h5>
                        <p>Ensure your <code>:hover</code>, <code>:focus</code>, and <code>:active</code> states also meet contrast requirements, not just the base state.</p>
                    </div>
                    <div className="practice-card">
                        <h5>Transparency Awareness</h5>
                        <p>If using RGBA or opacity, ensure the "flattered" result against the background still passes the 4.5:1 threshold.</p>
                    </div>
                    <div className="practice-card">
                        <h5>Use CSS Variables</h5>
                        <p>Store your accessible color palette in CSS variables. This makes it easy to audit and update your design system globally.</p>
                    </div>
                </div>

                <h3>How to Fix Poor Contrast?</h3>
                <p>If your colors fail the check in our tool, use the color swatch pickers to rapidly adjust the lightness or darkness. Lightening the lighter color or darkening the darker color will instantly improve the ratio coefficient. For designers, consider using semi-bold fonts for problematic color pairs to improve perceived legibility.</p>
            </SEOContent>

            <FAQ items={[
                { q: 'Is this checker fully WCAG 2.1 compliant?', a: <>Yes. Our algorithm uses the precise relative luminance mathematical formula specified by the W3C Web Content Accessibility Guidelines (WCAG 2.1) to compute scores. You can read the <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>official WCAG 2.1 documentation here</a>.</> },
                { q: 'What is considered "Large Text"?', a: 'According to WCAG, large text is defined as text that is 18pt (usually 24px) or larger, OR text that is 14pt (usually 18.66px) and bold.' },
                { q: 'What about buttons and icons?', a: 'User interface components, input boundaries, icons, and non-text graphics must meet a minimum contrast ratio of 3.0:1 against their adjacent colors to pass the WCAG AA standard.' },
                { q: 'Can I check Hex, RGB, and HSL?', a: 'Currently, the text input accepts Hexadecimal codes (e.g., #FFFFFF), but clicking the circular color swatch will open your systems native color picker, which natively supports RGB and HSL inputs on most devices.' },
            ]} />
        </div>
    );
}
