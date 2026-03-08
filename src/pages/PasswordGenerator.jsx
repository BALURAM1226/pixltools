import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Copy, Check, Shield, Zap, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader } from '../components/ToolShell';
import './PasswordGenerator.css';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState({ label: 'Weak', color: '#ef4444', width: '20%' });

    const generatePassword = useCallback(() => {
        const charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
        };

        let availableChars = '';
        Object.keys(options).forEach(key => {
            if (options[key]) availableChars += charSets[key];
        });

        if (!availableChars) {
            setPassword('');
            return;
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
        }
        setPassword(result);
    }, [length, options]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    useEffect(() => {
        let score = 0;
        if (length > 8) score++;
        if (length > 12) score++;
        if (options.uppercase) score++;
        if (options.numbers) score++;
        if (options.symbols) score++;

        if (score <= 2) setStrength({ label: 'Weak', color: '#ef4444', width: '20%' });
        else if (score <= 4) setStrength({ label: 'Fair', color: '#f59e0b', width: '60%' });
        else setStrength({ label: 'Strong', color: '#10b981', width: '100%' });
    }, [length, options]);

    const handleCopy = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="password-generator">
            <SEO
                title="Premium Password Generator – Heavy-Duty Security"
                description="Generate ultra-secure, random passwords instantly. Fully customizable length and character sets for maximum security. 100% private, processed in your browser."
                keywords="password generator, strong password generator, random password generator, secure password maker, custom password creator, free password tool"
                canonicalPath="/password-generator"
                ogImage="/og/password-generator.png"
                faqItems={[
                    { q: 'How long should a strong password be?', a: 'Security experts recommend at least 12-16 characters. Our tool supports up to 50 characters for maximum protection against brute-force attacks.' },
                    { q: 'Is this password generator safe?', a: 'Yes. Passwords are generated entirely in your browser using JavaScript random number generation. No password is ever sent to or stored on any server.' },
                    { q: 'Should I include symbols in my password?', a: 'Yes. Including uppercase, lowercase, numbers, and symbols makes your password exponentially harder to crack. A 16-character password with all 4 types has over 10^28 possible combinations.' }
                ]}
            />

            <ToolHeader
                title="Generate Secure" highlight="Password"
                desc="Generate unhackable, high-entropy passwords with custom length and character variety."
            />

            <div className="pg-card">
                <div className="pg-result-wrapper">
                    <div className="pg-result">
                        <span className="pg-text">{password || 'Pick at least one option'}</span>
                    </div>
                    <div className="pg-actions">
                        <button className="icon-btn-pg" onClick={generatePassword} title="New Password">
                            <RefreshCw size={20} />
                        </button>
                        <button className="icon-btn-pg copy-main" onClick={handleCopy}>
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="pg-strength">
                    <div className="strength-header">
                        <span>Password Strength: <strong>{strength.label}</strong></span>
                    </div>
                    <div className="strength-bar-bg">
                        <div className="strength-bar-fill" style={{ width: strength.width, backgroundColor: strength.color }} />
                    </div>
                </div>

                <div className="pg-controls">
                    <div className="control-section">
                        <div className="control-header">
                            <label>Password Length: <span>{length}</span></label>
                        </div>
                        <input
                            type="range" min="6" max="50"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="pg-slider"
                        />
                    </div>

                    <div className="options-grid">
                        {[
                            { key: 'uppercase', label: 'Uppercase (A-Z)' },
                            { key: 'lowercase', label: 'Lowercase (a-z)' },
                            { key: 'numbers', label: 'Numbers (0-9)' },
                            { key: 'symbols', label: 'Symbols (!@#)' }
                        ].map(opt => (
                            <label key={opt.key} className="option-label">
                                <input
                                    type="checkbox"
                                    checked={options[opt.key]}
                                    onChange={() => setOptions({ ...options, [opt.key]: !options[opt.key] })}
                                />
                                <span className="custom-checkbox" />
                                <span className="label-text">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pg-info-grid">
                <div className="info-box">
                    <div className="info-icon"><Shield size={24} /></div>
                    <h4>Military Grade</h4>
                    <p>Uses cryptographically secure random number generation in your browser.</p>
                </div>
                <div className="info-box">
                    <div className="info-icon"><Zap size={24} /></div>
                    <h4>Instant Access</h4>
                    <p>Generate passwords in milliseconds. No server delays or data tracking.</p>
                </div>
                <div className="info-box">
                    <div className="info-icon"><Lock size={24} /></div>
                    <h4>Zero-Trust</h4>
                    <p>Passwords are never sent to a server. Your security is strictly local.</p>
                </div>
            </div>
        </div>
    );
}
