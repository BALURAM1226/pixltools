import React, { useState } from 'react';
import { diff } from 'fast-myers-diff';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Btn, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import './DiffChecker.css';
import { Trash2, Copy, Check, Columns, Rows } from 'lucide-react';

export default function DiffChecker() {
    const [original, setOriginal] = useState('');
    const [modified, setModified] = useState('');
    const [diffResult, setDiffResult] = useState(null);
    const [diffType, setDiffType] = useState('lines'); // 'lines', 'words', 'chars'
    const [viewMode, setViewMode] = useState('split'); // 'split', 'unified'
    const [copied, setCopied] = useState(false);

    const handleCompare = () => {
        let oldTokens, newTokens;

        if (diffType === 'lines') {
            // Keep the \n at the end of each line to reconstruct properly
            oldTokens = original.split(/(\n)/g).filter(x => x !== "");
            newTokens = modified.split(/(\n)/g).filter(x => x !== "");
        } else if (diffType === 'words') {
            oldTokens = original.split(/(\s+)/g).filter(x => x !== "");
            newTokens = modified.split(/(\s+)/g).filter(x => x !== "");
        } else {
            oldTokens = original.split('');
            newTokens = modified.split('');
        }

        const changes = Array.from(diff(oldTokens, newTokens));
        const result = [];
        let oldIdx = 0;

        for (const [os, oe, ns, ne] of changes) {
            // 1. Add unchanged part before the change
            if (os > oldIdx) {
                result.push({
                    value: oldTokens.slice(oldIdx, os).join(''),
                    unchanged: true
                });
            }

            // 2. Add removed part
            if (oe > os) {
                result.push({
                    value: oldTokens.slice(os, oe).join(''),
                    removed: true
                });
            }

            // 3. Add added part
            if (ne > ns) {
                result.push({
                    value: newTokens.slice(ns, ne).join(''),
                    added: true
                });
            }

            oldIdx = oe;
        }

        // 4. Add remaining unchanged part
        if (oldIdx < oldTokens.length) {
            result.push({
                value: oldTokens.slice(oldIdx).join(''),
                unchanged: true
            });
        }

        setDiffResult(result);

        // Auto-scroll to result
        setTimeout(() => {
            document.getElementById('diff-output-scroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleClear = () => {
        setOriginal('');
        setModified('');
        setDiffResult(null);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(modified);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="diff-checker-page">
            <SEO
                title="Online Diff Checker – Compare Text & Code Side-by-Side"
                description="Compare two texts or code snippets to find differences instantly. Highlights additions and deletions with a clean, professional UI. 100% private."
                keywords="diff checker, compare text online, code difference, text comparison tool, find differences in text, online diff tool, side by side diff, code diff online free"
                canonicalPath="/diff-checker"
                ogImage="/og/diff-checker.jpg"
                faqItems={[
                    { q: 'Is my code secure?', a: 'Yes. We use client-side JavaScript to perform the comparison. Nothing is uploaded to our cloud servers.' },
                    { q: 'What do the colors mean?', a: 'Green highlights text that was added, while red represents text that was deleted from the original version.' },
                    { q: 'Can I compare large files?', a: 'The tool handles up to several thousand lines comfortably. For extremely large files (multi-megabyte), performance depends on your browser memory.' }
                ]}
            />

            <ToolHeader
                title="Diff"
                highlight="Checker"
                badge="📂 Code Comparison"
                desc="Instantly identify changes between two blocks of text or code. Supports line-by-line, word-by-word, and character-level diffing."
            />

            <ToolGrid>
                <Panel title="Original Text (Base)">
                    <textarea
                        className="modern-input diff-textarea"
                        placeholder="Paste the original version here..."
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        spellCheck={false}
                    />
                </Panel>
                <Panel title="Modified Text (Changed)">
                    <textarea
                        className="modern-input diff-textarea"
                        placeholder="Paste the new/changed version here..."
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        spellCheck={false}
                    />
                </Panel>
            </ToolGrid>

            <div className="diff-actions-bar">
                <div className="diff-settings">
                    <div className="setting-group">
                        <span>Comparison:</span>
                        <div className="pill-group">
                            <button className={diffType === 'lines' ? 'active' : ''} onClick={() => setDiffType('lines')}>Lines</button>
                            <button className={diffType === 'words' ? 'active' : ''} onClick={() => setDiffType('words')}>Words</button>
                            <button className={diffType === 'chars' ? 'active' : ''} onClick={() => setDiffType('chars')}>Chars</button>
                        </div>
                    </div>
                </div>

                <div className="main-btns">
                    <Btn onClick={handleCompare} disabled={!original && !modified}>
                        Compare Now
                    </Btn>
                    <Btn onClick={handleClear} variant="ghost" full={false}>
                        <Trash2 size={18} />
                    </Btn>
                </div>
            </div>

            {diffResult && (
                <div id="diff-output-scroll" className="diff-result-container fade-in">
                    <div className="result-header">
                        <div className="view-selector">
                            <button className={viewMode === 'split' ? 'active' : ''} onClick={() => setViewMode('split')}>
                                <Columns size={16} /> Split View
                            </button>
                            <button className={viewMode === 'unified' ? 'active' : ''} onClick={() => setViewMode('unified')}>
                                <Rows size={16} /> Unified View
                            </button>
                        </div>
                        <button className="copy-btn" onClick={handleCopy}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy Result'}
                        </button>
                    </div>

                    <div className={`diff-viewer ${viewMode}`}>
                        {viewMode === 'unified' ? (
                            <pre className="diff-pre">
                                {diffResult.map((part, index) => (
                                    <span
                                        key={index}
                                        className={part.added ? 'added' : part.removed ? 'removed' : 'unchanged'}
                                    >
                                        {part.value}
                                    </span>
                                ))}
                            </pre>
                        ) : (
                            <div className="split-viewer">
                                <div className="split-pane original">
                                    <div className="pane-label">Original</div>
                                    <pre className="diff-pre">
                                        {diffResult.map((part, index) => (
                                            !part.added && (
                                                <span key={index} className={part.removed ? 'removed' : 'unchanged'}>
                                                    {part.value}
                                                </span>
                                            )
                                        ))}
                                    </pre>
                                </div>
                                <div className="split-pane changed">
                                    <div className="pane-label">Modified</div>
                                    <pre className="diff-pre">
                                        {diffResult.map((part, index) => (
                                            !part.removed && (
                                                <span key={index} className={part.added ? 'added' : 'unchanged'}>
                                                    {part.value}
                                                </span>
                                            )
                                        ))}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AdBanner slot="9999999999" />

            <SEOContent title="Why use an Online Diff Checker?">
                <p>A diff checker is an essential tool for developers, writers, and editors to quickly identify what has changed between two versions of a document or code file.</p>

                <h3>Types of Comparison</h3>
                <ul>
                    <li><strong>Line-by-Line:</strong> Best for source code and structured data where each change usually happens on a new line.</li>
                    <li><strong>Word-by-Word:</strong> Ideal for articles, blog posts, and long-form writing to see exactly which words were edited.</li>
                    <li><strong>Character-Level:</strong> Use this for very precise comparisons, such as finding a single mismatched character in a hash or API key.</li>
                </ul>

                <h3>Privacy Guaranteed</h3>
                <p>Binary comparison logic happens entirely in your browser using the <code>fast-myers-diff</code> (MIT) library. Your sensitive code or text snippets are never sent to any server for processing.</p>
            </SEOContent>

            <FAQ items={[
                { q: "Is my code secure?", a: "Yes. We use client-side JavaScript to perform the comparison. Nothing is uploaded to our cloud servers." },
                { q: "What do the colors mean?", a: "Green highlights text that was added, while red represents text that was deleted from the original version." },
                { q: "Can I compare large files?", a: "The tool handles up to several thousand lines comfortably. For extremely large files (multi-megabyte), performance depend on your browser's memory." }
            ]} />
        </div>
    );
}
