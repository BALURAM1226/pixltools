import React, { useState } from 'react';
import { Copy, Trash2, Check, AlignLeft, Hash } from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader, Btn } from '../components/ToolShell';
import './JSONFormatter.css';

export default function JSONFormatter() {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFormat = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 4));
            setError('');
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    const handleMinify = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed));
            setError('');
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setInput('');
        setError('');
    };

    return (
        <div className="json-formatter">
            <SEO
                title="Premium JSON Formatter & Validator – Beautify Code"
                description="Fast, private JSON beautifier and validator. Clean up messy JSON code instantly in your browser."
                keywords="json formatter, beautify json online, validate json, minify json, json editor, pretty print json, json viewer, developer data tools, verify json syntax"
                canonicalPath="/json-formatter"
            />

            <ToolHeader
                title="JSON" highlight="Formatter"
                desc="Beautify, minify, and validate your JSON data instantly. 100% private processing."
            />

            <div className="tool-card-premium">
                <div className="json-toolbar">
                    <div className="toolbar-left">
                        <Btn size="sm" onClick={handleFormat} variant="primary">
                            <AlignLeft size={16} /> Beautify
                        </Btn>
                        <Btn size="sm" onClick={handleMinify} variant="secondary">
                            <Hash size={16} /> Minify
                        </Btn>
                    </div>
                    <div className="toolbar-right">
                        <button className="icon-btn" onClick={handleCopy} title="Copy JSON">
                            {copied ? <Check size={18} color="var(--green)" /> : <Copy size={18} />}
                        </button>
                        <button className="icon-btn delete" onClick={handleClear} title="Clear All">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="json-editor-container">
                    <textarea
                        className={`modern-input json-textarea ${error ? 'has-error' : ''}`}
                        placeholder='Paste your JSON here (e.g., {"key": "value"})'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    {error && <div className="json-error-badge">{error}</div>}
                </div>
            </div>

            <div className="pro-tips">
                <h3>💡 Pro Tips</h3>
                <ul>
                    <li>Paste any valid JSON to automatically detect structure errors.</li>
                    <li>Use "Minify" to reduce data size for API calls.</li>
                    <li>Your data never leaves your browser — it's processed entirely locally.</li>
                </ul>
            </div>
        </div>
    );
}
