import React, { useState } from 'react';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Btn, InfoChips, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import './HtmlWcagValidator.css';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function HtmlWcagValidator() {
    const [htmlCode, setHtmlCode] = useState('');
    const [results, setResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [strictAria, setStrictAria] = useState(false);

    // Analysis logic
    const analyzeHtml = () => {
        if (!htmlCode.trim()) return;

        setIsAnalyzing(true);

        setTimeout(() => {
            const parser = new DOMParser();
            // Using 'text/html' allows it to parse full pages or snippets gracefully
            const doc = parser.parseFromString(htmlCode, 'text/html');

            const issues = [];

            // Helper: Check if the input is actually HTML or just plain text/garbage
            const isValidHtml = () => {
                const trimmed = htmlCode.trim();
                // Basic check for tag-like structures
                if (!trimmed.includes('<') || !trimmed.includes('>')) return false;

                // Check if DOMParser found a parsererror (mostly works in XML mode, but in text/html it often wraps it)
                const errorNode = doc.querySelector('parsererror');
                if (errorNode) return false;

                // For text/html, if it's completely invalid, the body might just contain the raw text
                // We check if there's at least one non-meta element or if the body length makes sense
                const bodyElements = doc.body.querySelectorAll('*');
                if (bodyElements.length === 0 && trimmed.length > 30) return false;

                return true;
            };

            if (!isValidHtml()) {
                issues.push({
                    type: 'error',
                    level: 'A',
                    wcag: 'Syntax Validation',
                    title: 'Invalid HTML Structure',
                    description: 'The pasted code does not appear to be valid HTML or is severely malformed.',
                    help: 'Ensure you are pasting a valid HTML snippet or exported DOM from your browser developer tools.',
                    devExplanation: 'The DOMParser could not identify a valid tag hierarchy in the provided string. Check for missing brackets or non-HTML content.',
                    snippet: htmlCode.substring(0, 100) + (htmlCode.length > 100 ? '...' : ''),
                    domPath: 'root'
                });

                setResults({
                    issues,
                    htmlValid: false,
                    stats: { scanned: 0, images: 0, buttons: 0, links: 0 }
                });
                setIsAnalyzing(false);
                return;
            }

            const getDomPath = (el) => {
                if (!el) return "";
                let path = [];
                while (el.nodeType === Node.ELEMENT_NODE) {
                    let selector = el.nodeName.toLowerCase();
                    if (el.id) {
                        selector += '#' + el.id;
                        path.unshift(selector);
                        break;
                    } else {
                        let sib = el, nth = 1;
                        while ((sib = sib.previousElementSibling)) {
                            if (sib.nodeName.toLowerCase() === selector) nth++;
                        }
                        if (nth !== 1) selector += ":nth-of-type(" + nth + ")";
                    }
                    path.unshift(selector);
                    el = el.parentNode;
                }
                return path.join(" > ");
            };

            const getElementSnippet = (el) => {
                const clone = el.cloneNode(false);
                let html = clone.outerHTML;
                // Basic truncation if the snippet gets wildly long
                if (html.length > 120) html = html.substring(0, 117) + '...>';
                return html;
            };

            // 1. Missing Alt Attributes on Images
            const images = Array.from(doc.querySelectorAll('img'));
            const missingAltImages = images.filter(img => !img.hasAttribute('alt'));
            missingAltImages.forEach(img => {
                issues.push({
                    type: 'error',
                    level: 'A',
                    wcag: '1.1.1 Non-text Content',
                    title: 'Missing Alt Text',
                    description: `Found an image missing an "alt" attribute. Screen readers need this to describe visuals.`,
                    help: 'Add alt="description" to your <img> tag. If decorative, use alt="".',
                    devExplanation: 'Images require a text alternative so screen readers can announce them. If the image is purely decorative, use an empty alt attribute (alt="") so screen readers ignore it.',
                    snippet: getElementSnippet(img),
                    domPath: getDomPath(img)
                });
            });

            // 2. Buttons without accessible text
            const buttons = Array.from(doc.querySelectorAll('button'));
            const emptyButtons = buttons.filter(btn => {
                if (btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby')) return false;
                if (btn.textContent.trim().length > 0) return false;
                const img = btn.querySelector('img[alt]');
                if (img && img.getAttribute('alt').trim().length > 0) return false;
                const svgTitle = btn.querySelector('svg title');
                if (svgTitle && svgTitle.textContent.trim().length > 0) return false;
                return true;
            });
            emptyButtons.forEach(btn => {
                issues.push({
                    type: 'error',
                    level: 'A',
                    wcag: '4.1.2 Name, Role, Value',
                    title: 'Empty Button',
                    description: `Found a button without text or aria-labels.`,
                    help: 'Ensure buttons have text content, an aria-label, or contain an image with alt text.',
                    devExplanation: 'Buttons must have an accessible name. Without this, a screen reader will just announce "button" and users will not know its purpose.',
                    snippet: getElementSnippet(btn),
                    domPath: getDomPath(btn)
                });
            });

            // 3. Links without accessible text
            const links = Array.from(doc.querySelectorAll('a[href]'));
            const emptyLinks = links.filter(a => {
                if (a.hasAttribute('aria-label') || a.hasAttribute('aria-labelledby')) return false;
                if (a.textContent.trim().length > 0) return false;
                const img = a.querySelector('img[alt]');
                if (img && img.getAttribute('alt').trim().length > 0) return false;
                const svgTitle = a.querySelector('svg title');
                if (svgTitle && svgTitle.textContent.trim().length > 0) return false;
                return true;
            });
            emptyLinks.forEach(a => {
                issues.push({
                    type: 'error',
                    level: 'A',
                    wcag: '2.4.4 Link Purpose (In Context)',
                    title: 'Empty Link',
                    description: `Found a hyperlink without readable text.`,
                    help: 'Links must have descriptive text. If it is an icon link, add an aria-label="destination".',
                    devExplanation: 'Links must clearly describe their destination. If the link only contains an icon, provide a visually hidden text alternative or an aria-label.',
                    snippet: getElementSnippet(a),
                    domPath: getDomPath(a)
                });
            });

            // 4. Form inputs without labels
            const inputs = Array.from(doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'));
            const unlabelledInputs = inputs.filter(inp => {
                if (inp.hasAttribute('aria-label') || inp.hasAttribute('aria-labelledby') || inp.hasAttribute('title')) return false;
                if (inp.closest('label')) return false; // Implicitly wrapped in label
                if (inp.id) {
                    const label = doc.querySelector(`label[for="${inp.id}"]`);
                    if (label) return false; // Explicit label mapping
                }
                return true;
            });
            unlabelledInputs.forEach(inp => {
                issues.push({
                    type: 'warning',
                    level: 'A',
                    wcag: '3.3.2 Labels or Instructions',
                    title: 'Missing Form Label',
                    description: `Found a form input lacking an associated <label> or aria-label.`,
                    help: 'Wrap inputs in a <label> or use the "for" attribute linking to the input\'s "id".',
                    devExplanation: 'Form inputs require a programmatic label so assistive technologies can identify the input purpose. Associate a <label> using the "for" attribute.',
                    snippet: getElementSnippet(inp),
                    domPath: getDomPath(inp)
                });
            });

            // 5. Document structure - Title
            // If htmlCode contains <html> or <head> we check if title exists
            if (htmlCode.toLowerCase().includes('<html') || htmlCode.toLowerCase().includes('<!doctype')) {
                const title = doc.querySelector('title');
                if (!title || title.textContent.trim().length === 0) {
                    issues.push({
                        type: 'error',
                        level: 'A',
                        wcag: '2.4.2 Page Titled',
                        title: 'Missing Page <title>',
                        description: 'The HTML document is missing a <title> element inside the <head>.',
                        help: 'Screen readers rely on the page title to tell the user what page they are on.',
                        devExplanation: 'The <title> element provides the document name. It is the first thing a screen reader announces when a page loads.',
                        snippet: '<head>...</head>',
                        domPath: 'html > head'
                    });
                }
            }

            // 6. Multiple H1s
            const h1s = Array.from(doc.querySelectorAll('h1'));
            if (h1s.length > 1) {
                issues.push({
                    type: 'warning',
                    level: 'AA',
                    wcag: '1.3.1 Info and Relationships',
                    title: 'Multiple <h1> Tags',
                    description: `Found ${h1s.length} <h1> tags. Best practice is generally one logical <h1> per page.`,
                    help: 'Consider using an <h1> for the main page title and <h2>, <h3> for subsections.',
                    devExplanation: 'Screen reader users often use heading structures to navigate a page. Multiple <h1> tags can confuse the logical document outline.',
                    snippet: `Found ${h1s.length} <h1> tags`,
                    domPath: 'document'
                });
            }

            // 7. Strict ARIA Validation (Optional)
            if (strictAria) {
                const ariaAttrs = ['aria-controls', 'aria-describedby', 'aria-labelledby', 'aria-owns', 'aria-activedescendant', 'aria-details', 'aria-errormessage'];
                ariaAttrs.forEach(attr => {
                    const elements = Array.from(doc.querySelectorAll(`[${attr}]`));
                    elements.forEach(el => {
                        const targetIds = el.getAttribute(attr).split(/\s+/).filter(Boolean);
                        targetIds.forEach(id => {
                            if (!doc.getElementById(id)) {
                                issues.push({
                                    type: 'error',
                                    level: 'A',
                                    wcag: '4.1.2 Name, Role, Value',
                                    title: `Missing ARIA Relational Target`,
                                    description: `An element defines a relational ${attr}="${id}" attribute, but the target ID is missing or does not exist on the page.`,
                                    help: `Ensure the ID referenced by ${attr} actually exists within the DOM, or remove the attribute to avoid screen reader errors.`,
                                    devExplanation: `Relational ARIA attributes must point to valid DOM IDs in the document. Broken references can cause assistive technologies to fail unexpectedly.`,
                                    snippet: getElementSnippet(el),
                                    domPath: getDomPath(el)
                                });
                            }
                        });
                    });
                });
            }

            // Calculate Stats
            const totalElementsScanned = doc.body.getElementsByTagName('*').length;

            setResults({
                issues,
                htmlValid: issues.length === 0,
                stats: {
                    scanned: totalElementsScanned,
                    images: images.length,
                    buttons: buttons.length,
                    links: links.length
                }
            });

            setIsAnalyzing(false);
        }, 400);
    };

    const handleClear = () => {
        setHtmlCode('');
        setResults(null);
    };

    const exportJson = () => {
        if (!results || !results.issues) return;
        const exportData = {
            scanDate: new Date().toISOString(),
            stats: results.stats,
            issues: results.issues
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const anchor = document.createElement('a');
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", "accessibility_wcag_report.json");
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    return (
        <div className="validator-page">
            <SEO
                title="HTML WCAG Validator – Accessibility Checker for React, NextJS & HTML"
                description="Paste raw HTML, React templates, or Next.js DOM outputs to instantly check for WCAG accessibility violations. Free, private, running in your browser."
                keywords="wcag validator, html accessibility checker, react accessibility, nextjs wcag test, missing alt tags, aria-label checker, a11y scanner, web accessibility audit, 508 compliance test, aria validator online"
                canonicalPath="/html-wcag-validator"
                ogImage="/og/html-wcag-validator.jpg"
                faqItems={[
                    { q: 'Is this process private? Can I paste confidential code?', a: 'Completely private. The analysis engine uses your browser native local DOMParser to process the nodes in memory locally. Your code is never serialized, never sent over a network, and never stored on a server. It is perfectly safe for proprietary pre-released apps.' },
                    { q: 'Can I paste raw JSX directly into the checker?', a: 'Yes! While JSX uses camelCase properties (like className) instead of standard lowercase attributes, this parser is forgiving and will successfully test the structure. However, for maximum 100% accuracy, we recommend inspecting your browser and copying the finalized rendered outerHTML.' },
                    { q: 'Why are empty buttons a WCAG error?', a: 'Modern web design uses a lot of icon-only elements (e.g. a Hamburger menu using an SVG). A screen reader cannot see the icon. If the button lacks an internal span or an aria-label, blind users simply hear Button read aloud without any context on what it does when clicked.' },
                    { q: 'What does Strict ARIA Validation do?', a: 'ARIA allows you to link complex elements together (e.g. an input field to a distant error message) using attributes like aria-describedby. The Strict Validation toggle crawls your code to guarantee that every single ID referenced by an ARIA tag actually exists in the DOM snippet.' },
                    { q: 'Why is testing React and NextJS apps for accessibility so difficult?', a: 'Because they are Single Page Applications (SPAs). If you try to run a standard URL accessibility scanner, it will usually only see an empty div element because the JavaScript has not painted the application yet. By copying the DOM directly into this tool, you bypass that completely.' }
                ]}
            />

            <ToolHeader
                title="HTML WCAG"
                highlight="Validator"
                badge="🚀 React & Next.js Friendly"
                desc="Ensure your web apps are accessible. Paste rendered HTML from React, Next.js, or any static site. We analyze the DOM offline for WCAG compliance instantly."
            />

            <ToolGrid>
                {/* ── Left: Input ── */}
                <Panel title="Step 1: Paste HTML Code">
                    <div className="validator-input-area">
                        <textarea
                            className="code-textarea"
                            placeholder="Paste your raw HTML, rendered DOM, or JSX snippet here...&#10;&#10;e.g. <img src='logo.png' />"
                            value={htmlCode}
                            onChange={(e) => setHtmlCode(e.target.value)}
                            spellCheck={false}
                            aria-label="HTML code input"
                        />
                        <div className="validator-actions">
                            <Btn onClick={analyzeHtml} loading={isAnalyzing} disabled={!htmlCode.trim() || isAnalyzing}>
                                🔍 Run WCAG Audit
                            </Btn>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                <input
                                    type="checkbox"
                                    checked={strictAria}
                                    onChange={(e) => setStrictAria(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                                />
                                Strict ARIA Validation
                            </label>
                            <button className="clear-btn" onClick={handleClear} disabled={!htmlCode.trim()} style={{ marginLeft: 'auto' }}>
                                Clear
                            </button>
                        </div>
                        {results && results.stats && (
                            <div style={{ marginTop: 16 }}>
                                <InfoChips items={[
                                    { label: 'Elements Scanned', value: results.stats.scanned },
                                    { label: 'Images Handled', value: results.stats.images },
                                    { label: 'Links Checked', value: results.stats.links },
                                ]} />
                            </div>
                        )}
                    </div>
                </Panel>

                {/* ── Right: Results ── */}
                <Panel title="Step 2: Accessibility Report">
                    {!results ? (
                        <div className="empty-results">
                            <Info size={48} className="empty-icon" />
                            <h3>Awaiting Code</h3>
                            <p>Paste your HTML on the left and run the audit. We'll find missing labels, bad alt tags, and structural flaws.</p>
                        </div>
                    ) : results.htmlValid ? (
                        <div className="success-results">
                            <CheckCircle size={56} className="success-icon" />
                            <h3>Perfect Accessibility!</h3>
                            <p>We found zero common structural WCAG violations in your provided snippet. Great job!</p>
                        </div>
                    ) : (
                        <div className="issues-list">
                            <div className="issues-header">
                                <h3 style={{ color: results.issues.some(i => i.type === 'error') ? 'var(--red)' : 'var(--amber)' }}>
                                    Found {results.issues.length} Potential Issue(s)
                                </h3>
                            </div>

                            <div className="issues-grid">
                                {results.issues.map((issue, idx) => (
                                    <div key={idx} className={`issue-card issue-${issue.type}`}>
                                        <div className="issue-card-header">
                                            <span className="issue-icon">
                                                {issue.type === 'error' ? <AlertTriangle size={18} /> : <Info size={18} />}
                                            </span>
                                            <h4 className="issue-title">{issue.title}</h4>
                                            <span className={`issue-badge badge-${issue.type}`}>
                                                {issue.type === 'error' ? 'Critical' : 'Warning'}
                                            </span>
                                        </div>

                                        <div className="issue-meta-pills">
                                            {issue.level && <span className="meta-pill">Level {issue.level}</span>}
                                            {issue.wcag && <span className="meta-pill">{issue.wcag}</span>}
                                        </div>

                                        <p className="issue-desc">{issue.description}</p>

                                        {issue.domPath && (
                                            <div className="dom-path">
                                                <strong>Path: </strong>{issue.domPath}
                                            </div>
                                        )}

                                        {issue.snippet && (
                                            <div className="issue-snippet">
                                                <code>{issue.snippet}</code>
                                            </div>
                                        )}

                                        <div className="issue-help">
                                            <strong>How to fix: </strong> {issue.help}
                                            {issue.devExplanation && <div className="dev-explanation">{issue.devExplanation}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Panel>
            </ToolGrid>

            {results && !results.htmlValid && results.issues.length > 0 && (
                <div className="export-panel">
                    <div className="export-info">
                        <h3>Step 3: Export Full Report</h3>
                        <p>Download a comprehensive JSON breakdown of all structural violations mapped to WCAG IDs and explicit DOM node routes.</p>
                    </div>
                    <Btn onClick={exportJson} full={false} style={{ whiteSpace: 'nowrap' }}>
                        💾 Download JSON
                    </Btn>
                </div>
            )}

            <AdBanner slot="9999999999" />

            <SEOContent title="How to test React and Next.js applications for WCAG">
                <p>This tool is uniquely designed to aid modern web developers. While traditional URL accessibility scanners struggle with Single Page Applications (SPAs) built in React, Next.js, and Vue due to client-side rendering firewalls, this tool allows you to bypass the network completely.</p>

                <h3>How to test a Next.js / React page?</h3>
                <p>1. Open your running React or Next.js app in Google Chrome.<br />2. Right-click the page and select <strong>Inspect</strong>.<br />3. In the Elements panel, find the main app wrapper (usually <code>&lt;div id="__next"&gt;</code> or <code>&lt;div id="root"&gt;</code>).<br />4. Right-click that element, select <strong>Copy &gt; Copy outerHTML</strong>.<br />5. Paste that massive block of code directly into our tool above and click Run.</p>

                <h3>What does this HTML Validator check for?</h3>
                <ul>
                    <li><strong>Text Alternatives (Level A | WCAG 1.1.1):</strong> Flags <code>&lt;img&gt;</code> tags missing <code>alt</code> attributes. Screen readers rely entirely on this property to announce visuals to visually impaired users.</li>
                    <li><strong>Empty Actionables (Level A | WCAG 4.1.2):</strong> Scans for <code>&lt;button&gt;</code> and <code>&lt;a&gt;</code> tags that contain no readable text or aria-labels. This is extremely common in modern UI development where buttons are built using only raw SVG icons.</li>
                    <li><strong>Form Linking (Level A | WCAG 3.3.2):</strong> Detects text inputs, checkboxes, and selects that lack an associated programmatic label, ensuring users know exactly what data the form expects.</li>
                    <li><strong>Document Titles (Level A | WCAG 2.4.2):</strong> Checks full page dumps for missing or empty <code>&lt;title&gt;</code> elements inside the head, which is the primary navigation hook.</li>
                    <li><strong>Heading Hierarchy (Level AA | WCAG 1.3.1):</strong> Validates that the page structure follows best practices, specifically alerting developers if multiple <code>&lt;h1&gt;</code> elements are bleeding into the same layout.</li>
                    <li><strong>Strict Relational ARIA (Level A | WCAG 4.1.2):</strong> Optionally analyzes complex multi-element arrays to verify that any ID referenced within an aria relationship (e.g. <code>aria-controls="..."</code>, <code>aria-labelledby="..."</code>) actually resolves to an existing element in the DOM tree, preventing fatal screen reader crashes.</li>
                </ul>

                <h3>The Professional ARIA Best Practices</h3>
                <div className="best-practices-grid">
                    <div className="practice-card">
                        <h5>1. The First Rule of ARIA</h5>
                        <p>If you can use a native HTML element (like <code>&lt;button&gt;</code>) instead of a custom role (like <code>role="button"</code>), always use the native one. It is more robust and accessible by default.</p>
                    </div>
                    <div className="practice-card">
                        <h5>2. Accurate ARIA Labels</h5>
                        <p>Only use <code>aria-label</code> when there is no visible text. If there is visible text that labels an element, use <code>aria-labelledby</code> to link them instead of repeating the text.</p>
                    </div>
                    <div className="practice-card">
                        <h5>3. Manage Focus & States</h5>
                        <p>Dynamic UI elements must update their ARIA states (like <code>aria-expanded</code> or <code>aria-selected</code>) instantly via JavaScript to inform screen reader users of layout changes.</p>
                    </div>
                    <div className="practice-card">
                        <h5>4. Handle Relationships</h5>
                        <p>Use <code>aria-describedby</code> to link form inputs to their specific error messages or helper instructions. This ensures the reader announces the context for the specific field.</p>
                    </div>
                </div>

                <div className="related-tool-cta">
                    <div className="cta-content">
                        <h4>🎨 Check your color accessibility!</h4>
                        <p>Accessibility isn't just about code structure. Ensure your color palette meets WCAG 2.1 AA & AAA standards with our <strong>Color Contrast Checker</strong>.</p>
                    </div>
                    <a href="/color-contrast-checker" className="cta-link-btn">
                        Open Contrast Checker
                    </a>
                </div>

                <p>Accessibility directly impacts your SEO ranking and audience retention. Running your final React DOM output through a static WCAG analyzer ensures you don't miss structural elements that generic component linters might overlook.</p>
            </SEOContent>

            <FAQ items={[
                { q: 'Is this process private? Can I paste confidential code?', a: 'Completely private. The analysis engine uses your browser\'s native local "DOMParser" to process the nodes in memory locally. Your code is never serialized, never sent over a network, and never stored on a server. It is perfectly safe for proprietary pre-released apps.' },
                { q: 'Can I paste raw JSX directly into the checker?', a: 'Yes! While JSX uses camelCase properties (like className) instead of standard lowercase attributes, this parser is forgiving and will successfully test the structure. However, for maximum 100% accuracy, we still recommend inspecting your browser and copying the finalized rendered "outerHTML".' },
                { q: 'Why are empty buttons a WCAG error?', a: 'Modern web design uses a lot of icon-only elements (e.g. a Hamburger menu using an SVG). A screen reader cannot "see" the icon. If the <button> lacks an internal span or an aria-label, blind users simply hear "Button" read aloud without any context on what it does when clicked.' },
                { q: 'What does "Strict ARIA Validation" do?', a: 'ARIA allows you to link complex elements together (e.g. an input field to a distant error message) using attributes like "aria-describedby". The Strict Validaton toggle crawls your code to guarantee that every single ID referenced by an ARIA tag actually exists in the DOM snippet. If you misspelled the ID, the tool flags it.' },
                { q: 'Why is testing React/NextJS apps for accessibility so difficult?', a: 'Because they are Single Page Applications (SPAs). If you try to run a standard URL accessibility scanner, it will usually only see an empty <div id="root"> element because the JavaScript hasn\'t painted the application yet. By copying the DOM directly into this tool, you bypass that completely.' },
                { q: 'Where can I read the official WCAG guidelines?', a: (<span>You can read the full, official Web Content Accessibility Guidelines (WCAG) directly from the W3C standards body here: <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>WCAG 2.1 Specification Document</a>.</span>) }
            ]} />
        </div>
    );
}
