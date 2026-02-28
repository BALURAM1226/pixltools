import React, { useState } from 'react';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Btn, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import { Trash2, AlertCircle } from 'lucide-react';

export default function JwtDebugger() {
    const [jwt, setJwt] = useState('');
    const [header, setHeader] = useState(null);
    const [payload, setPayload] = useState(null);
    const [error, setError] = useState('');

    const decodeJwt = () => {
        setError('');
        setHeader(null);
        setPayload(null);

        const parts = jwt.split('.');
        if (parts.length !== 3) {
            setError('Invalid JWT structure. A JWT must have 3 parts separated by dots.');
            return;
        }

        try {
            const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
            const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

            setHeader(decodedHeader);
            setPayload(decodedPayload);
        } catch (e) {
            setError('Failed to decode JWT parts. Ensure the string is a valid base-64 encoded JSON.');
        }
    };

    const handleClear = () => {
        setJwt('');
        setHeader(null);
        setPayload(null);
        setError('');
    };

    return (
        <div className="jwt-tool-page">
            <SEO
                title="JWT Debugger – Decode JSON Web Tokens Locally"
                description="Easily decode and inspect JWT headers and payloads in your browser. 100% private, no server-side logging."
                keywords="jwt debugger, decode jwt, json web token, jwt inspector, auth debugger, bearer token decoder, jwt claims viewer, security tools"
                canonicalPath="/jwt-debugger"
            />

            <ToolHeader
                title="JWT"
                highlight="Debugger"
                badge="🔐 Security Utility"
                desc="Instantly decode JSON Web Tokens to inspect headers and claims. No data is sent to the server."
            />

            <ToolGrid>
                <Panel title="Encoded Token">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <textarea
                            className="modern-input"
                            style={{ minHeight: '180px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all' }}
                            placeholder="Paste your JWT here (header.payload.signature)..."
                            value={jwt}
                            onChange={(e) => setJwt(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Btn onClick={decodeJwt} disabled={!jwt.trim()}>
                                Decode Token
                            </Btn>
                            <Btn onClick={handleClear} variant="ghost" full={false}>
                                <Trash2 size={18} />
                            </Btn>
                        </div>
                        {error && (
                            <div style={{ color: '#f56565', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(245, 101, 101, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>
                </Panel>

                <Panel title="Decoded Result">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', color: '#63b3ed', textTransform: 'uppercase', marginBottom: '8px' }}>Header</h4>
                            <pre style={{
                                background: 'var(--bg-surface)',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                color: 'var(--text-primary)',
                                overflow: 'auto'
                            }}>
                                {header ? JSON.stringify(header, null, 2) : '// Header will appear here'}
                            </pre>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', color: '#f687b3', textTransform: 'uppercase', marginBottom: '8px' }}>Payload</h4>
                            <pre style={{
                                background: 'var(--bg-surface)',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                color: 'var(--text-primary)',
                                overflow: 'auto'
                            }}>
                                {payload ? JSON.stringify(payload, null, 2) : '// Payload will appear here'}
                            </pre>
                        </div>
                    </div>
                </Panel>
            </ToolGrid>

            <AdBanner slot="9999999999" />

            <SEOContent title="Is it safe to decode JWTs online?">
                <p>Decoding JWTs on public websites can sometimes be risky if they send your token to their backends. Our JWT Debugger is designed for the modern security-conscious developer.</p>
                <h3>Client-Side only</h3>
                <p>This implementation uses <code>atob()</code> in your browser window. Your sensitive authentication tokens never leave your computer. We do not store, log, or track your tokens in any way.</p>
                <h3>Verification</h3>
                <p>Note: This tool is for <strong>decoding and inspection</strong>. It does not verify the signature. You should use your internal server logic to verify token integrity against your private keys.</p>
            </SEOContent>

            <FAQ items={[
                { q: "What is a JWT?", a: "JSON Web Token (JWT) is an open standard that defines a compact way for securely transmitting information between parties as a JSON object." },
                { q: "Can this steal my login token?", a: "No. Unlike other online debuggers, we perform no network requests when you click 'Decode'. You can even use this tool offline." },
                { q: "What parts are in a JWT?", a: "A JWT typically consists of three parts: Header, Payload, and Signature, separated by dots." }
            ]} />
        </div>
    );
}
