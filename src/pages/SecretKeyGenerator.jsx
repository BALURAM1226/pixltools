import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Copy, Check, Terminal, Cpu, Database, Binary } from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader, Btn, AdBanner, FAQ, SEOContent } from '../components/ToolShell';
import '../components/ToolShell.css';
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
                title="JWT Secret Key Generator Online – HS256, HS512 & Encryption Keys"
                description="Generate cryptographically secure random keys for JWT authentication, API signing, and encryption. Supports HEX, Base64, Base64URL, and Alphanumeric formats up to 1024-bit. 100% private, processed in your browser."
                keywords="jwt secret key generator, hs256 secret key, hs512 key generator, generate secret key online, auth secret generator, encryption key generator, 256 bit key generator, base64 secret key, api key generator, random key generator"
                canonicalPath="/secret-generator"
                ogImage="/og/secret-generator.png"
                faqItems={[
                    { q: 'What is a JWT secret key?', a: 'A JWT secret key is a cryptographic string used to digitally sign JSON Web Tokens. When a server creates a JWT, it signs the payload with this secret. When the token is later presented, the server uses the same secret to verify the signature has not been tampered with.' },
                    { q: 'How long should my JWT secret key be?', a: 'For HS256, the minimum recommended length is 256 bits (32 bytes). For HS512, use 512 bits (64 bytes). Using a key shorter than the hash output weakens the security guarantee of the HMAC algorithm.' },
                    { q: 'Is this generator safe to use for production keys?', a: 'Yes. This tool uses the Web Crypto API (crypto.getRandomValues), which is the same CSPRNG used by major browsers for TLS/SSL connections. Your key is generated entirely in your browser and is never transmitted over the network.' },
                    { q: 'What is the difference between Hex and Base64 output?', a: 'Hex encoding uses characters 0-9 and a-f, resulting in a string that is 2x the byte length. Base64 encoding is more compact (approximately 1.33x the byte length) and is the standard format used in .env files and JWT libraries like jsonwebtoken for Node.js.' },
                    { q: 'Can I use this for AES encryption keys?', a: 'Absolutely. AES-128 requires a 128-bit key, and AES-256 requires a 256-bit key. Generate a key of the appropriate length in Hex format and use it directly with your encryption library.' },
                    { q: 'What does Base64 URL Safe mean?', a: 'Standard Base64 uses +, /, and = characters, which have special meanings in URLs. Base64 URL Safe replaces + with -, / with _, and strips trailing = padding. This is the format used inside JWT tokens themselves.' }
                ]}
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

            <AdBanner slot="5555555555" />

            <SEOContent title="How to Generate Secure JWT Secret Keys for Production">
                <p>A <strong>JWT (JSON Web Token) secret key</strong> is a cryptographic string used to sign and verify tokens in modern authentication systems. If your secret key is weak, predictable, or too short, attackers can forge tokens and impersonate any user in your application. This tool generates keys using your browser's <code>crypto.getRandomValues()</code> API, which sources entropy directly from your operating system's hardware random number generator (CSPRNG).</p>

                <div className="related-tool-cta">
                    <div className="cta-content">
                        <h4>🔐 Need a human-readable password instead?</h4>
                        <p>Our <strong>Password Generator</strong> creates strong, memorable passwords with custom rules for length, symbols, and character exclusions.</p>
                    </div>
                    <a href="/password-generator" className="cta-link-btn">
                        Open Password Generator
                    </a>
                </div>

                <h3>HS256 vs RS256: Which Key Do You Need?</h3>
                <ul>
                    <li><strong>HS256 (HMAC-SHA256):</strong> A <em>symmetric</em> algorithm. Both the server that creates the token and the server that verifies it share the <strong>same secret key</strong>. Use our tool to generate a <strong>256-bit (32-byte) Hex or Base64 key</strong> for this algorithm. This is the most common setup for single-server applications.</li>
                    <li><strong>HS384 / HS512:</strong> Identical concept to HS256 but with a longer hash. Use a <strong>512-bit (64-byte)</strong> key for HS512. This provides a wider security margin for high-security applications like banking APIs.</li>
                    <li><strong>RS256 (RSA-SHA256):</strong> An <em>asymmetric</em> algorithm that uses a public/private key pair. You do <strong>not</strong> need this tool for RS256 — you would use <code>openssl</code> to generate an RSA key pair instead.</li>
                </ul>

                <h3>What Key Length Should I Use?</h3>
                <ul>
                    <li><strong>128-bit (16 bytes):</strong> Suitable for internal API keys, session IDs, and non-critical tokens.</li>
                    <li><strong>256-bit (32 bytes):</strong> The <strong>industry standard</strong> for JWT HS256 secrets. Recommended by OWASP and the JWT RFC 7518 specification.</li>
                    <li><strong>512-bit (64 bytes):</strong> Required for HS512. Also used for AES-256 encryption keys in data-at-rest scenarios.</li>
                    <li><strong>1024-bit (128 bytes):</strong> Maximum entropy. Used for master secrets in key derivation functions (KDFs) like HKDF or PBKDF2.</li>
                </ul>

                <h3>Security Best Practices for Developers</h3>
                <div className="best-practices-grid">
                    <div className="practice-card">
                        <h5>Never Hardcode Secrets</h5>
                        <p>Store your keys in environment variables (<code>.env</code>) or a secrets manager like AWS Secrets Manager or HashiCorp Vault. Never commit them to Git.</p>
                    </div>
                    <div className="practice-card">
                        <h5>Rotate Keys Regularly</h5>
                        <p>Implement a key rotation strategy. Use a "kid" (Key ID) header in your JWTs so you can rotate secrets without invalidating all active tokens at once.</p>
                    </div>
                    <div className="practice-card">
                        <h5>Use Sufficient Length</h5>
                        <p>The JWT specification (RFC 7518) mandates that the key MUST be at least as long as the hash output. For HS256, that means a minimum of <strong>256 bits (32 bytes)</strong>.</p>
                    </div>
                    <div className="practice-card">
                        <h5>Verify the Algorithm</h5>
                        <p>Always validate the <code>alg</code> header on incoming JWTs server-side. The "None" algorithm attack is a classic exploit where an attacker sets the algorithm to "none" to bypass verification.</p>
                    </div>
                </div>

                <h3>Why Is This Tool More Secure Than <code>Math.random()</code>?</h3>
                <p>JavaScript's <code>Math.random()</code> is a <strong>pseudo-random number generator (PRNG)</strong> — its output is deterministic and can be predicted if the internal state is known. Our tool uses <code>window.crypto.getRandomValues()</code>, which is a <strong>Cryptographically Secure PRNG (CSPRNG)</strong> backed by your OS kernel's entropy pool (<code>/dev/urandom</code> on Linux, <code>BCryptGenRandom</code> on Windows). This makes the output computationally infeasible to predict.</p>
            </SEOContent>

            <FAQ items={[
                { q: 'What is a JWT secret key?', a: 'A JWT secret key is a cryptographic string used to digitally sign JSON Web Tokens. When a server creates a JWT, it signs the payload with this secret. When the token is later presented, the server uses the same secret to verify the signature has not been tampered with.' },
                { q: 'How long should my JWT secret key be?', a: 'For HS256, the minimum recommended length is 256 bits (32 bytes). For HS512, use 512 bits (64 bytes). Using a key shorter than the hash output weakens the security guarantee of the HMAC algorithm.' },
                { q: 'Is this generator safe to use for production keys?', a: 'Yes. This tool uses the Web Crypto API (crypto.getRandomValues), which is the same CSPRNG used by major browsers for TLS/SSL connections. Your key is generated entirely in your browser and is never transmitted over the network.' },
                { q: 'What is the difference between Hex and Base64 output?', a: 'Hex encoding uses characters 0-9 and a-f, resulting in a string that is 2x the byte length. Base64 encoding is more compact (approximately 1.33x the byte length) and is the standard format used in .env files and JWT libraries like jsonwebtoken for Node.js.' },
                { q: 'Can I use this for AES encryption keys?', a: 'Absolutely. AES-128 requires a 128-bit key, and AES-256 requires a 256-bit key. Generate a key of the appropriate length in Hex format and use it directly with your encryption library.' },
                { q: 'What does "Base64 URL Safe" mean?', a: 'Standard Base64 uses +, /, and = characters, which have special meanings in URLs. Base64 URL Safe replaces + with -, / with _, and strips trailing = padding. This is the format used inside JWT tokens themselves.' }
            ]} />
        </div>
    );
}
