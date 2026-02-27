import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Copy, Check, Terminal, Cpu, Database, Binary } from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader, Btn } from '../components/ToolShell';
import './SecretKeyGenerator.css';

const FORMATS = [
    { id: 'hex', label: 'Hexadecimal', desc: '0-9, a-f (Perfect for JWT/Auth)' },
    { id: 'base64', label: 'Base64', desc: 'Standard data encoding' },
    { id: 'base64url', label: 'Base64 URL Safe', desc: 'Safe for URLs and filenames' },
    { id: 'plain', label: 'Alphanumeric', desc: 'A-z, 0-9 characters' }
];

const PRESETS = [
    { label: '128-bit', bytes: 16 },
    { label: '256-bit', bytes: 32 },
    { label: '512-bit', bytes: 64 },
    { label: '1024-bit', bytes: 128 },
];

export default function SecretKeyGenerator() {
    const [key, setKey] = useState('');
    const [format, setFormat] = useState('hex');
    const [byteLength, setByteLength] = useState(32);
    const [copied, setCopied] = useState(false);

    const generateKey = useCallback(() => {
        const array = new Uint8Array(byteLength);
        window.crypto.getRandomValues(array);

        let result = '';
        if (format === 'hex') {
            result = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (format === 'base64') {
            result = btoa(String.fromCharCode(...array));
        } else if (format === 'base64url') {
            result = btoa(String.fromCharCode(...array))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        } else {
            // Alphanumeric with NO modulo bias
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charCount = chars.length;
            const maxValidByte = 256 - (256 % charCount);

            let temp = '';
            while (temp.length < byteLength) {
                const randomBytes = new Uint8Array(byteLength - temp.length + 10);
                window.crypto.getRandomValues(randomBytes);
                for (let i = 0; i < randomBytes.length && temp.length < byteLength; i++) {
                    if (randomBytes[i] < maxValidByte) {
                        temp += chars.charAt(randomBytes[i] % charCount);
                    }
                }
            }
            result = temp;
        }
        setKey(result);
    }, [format, byteLength]);

    useEffect(() => {
        generateKey();
    }, [generateKey]);

    const handleCopy = () => {
        if (!key) return;
        navigator.clipboard.writeText(key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="secret-gen">
            <SEO
                title="Professional Secret Key Generator – JWT & Encryption Keys"
                description="Generate cryptographically secure random keys for JWT, Auth, and Encryption. Supports HEX, Base64, and URL-Safe formats."
                canonicalPath="/secret-generator"
            />

            <ToolHeader
                title="Secret Key" highlight="Generator"
                desc="Generate cryptographically secure high-entropy strings for auth tokens, JWT secrets, and encryption keys."
            />

            <div className="sg-card">
                <div className="sg-key-display">
                    <div className="sg-key-inner">
                        <Terminal size={18} className="sg-terminal-icon" />
                        <code className="sg-key-text">{key}</code>
                    </div>
                    <div className="sg-main-actions">
                        <button className="sg-refresh-btn" onClick={generateKey} title="Regenerate">
                            <RefreshCw size={22} />
                        </button>
                        <Btn variant={copied ? "success" : "primary"} onClick={handleCopy} className="sg-copy-btn">
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied' : 'Copy Key'}
                        </Btn>
                    </div>
                </div>

                <div className="sg-configs">
                    <div className="sg-config-group">
                        <label className="sg-label">Key Strength (Length)</label>
                        <div className="sg-presets">
                            {PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    className={`sg-preset-btn ${byteLength === p.bytes ? 'active' : ''}`}
                                    onClick={() => setByteLength(p.bytes)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sg-config-group">
                        <label className="sg-label">Output Format</label>
                        <div className="sg-formats-grid">
                            {FORMATS.map(f => (
                                <div
                                    key={f.id}
                                    className={`sg-format-card ${format === f.id ? 'active' : ''}`}
                                    onClick={() => setFormat(f.id)}
                                >
                                    <div className="sg-format-info">
                                        <span className="sg-format-label">{f.label}</span>
                                        <span className="sg-format-desc">{f.desc}</span>
                                    </div>
                                    <div className="sg-radio">
                                        <div className="sg-radio-inner" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="sg-dev-info">
                <div className="dev-info-card">
                    <Cpu size={24} />
                    <h5>Browser Entropy</h5>
                    <p>Uses <code>crypto.getRandomValues()</code> for hardware-level randomness.</p>
                </div>
                <div className="dev-info-card">
                    <Database size={24} />
                    <h5>JWT Ready</h5>
                    <p>Generate 256-bit or 512-bit secrets for HS256/HS512 signatures.</p>
                </div>
                <div className="dev-info-card">
                    <Binary size={24} />
                    <h5>Zero-Leak</h5>
                    <p>Processed entirely in-RAM. No logs, no history, no network activity.</p>
                </div>
            </div>
        </div>
    );
}
