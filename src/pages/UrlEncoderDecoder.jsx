import React, { useState } from 'react';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Btn, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import { Trash2 } from 'lucide-react';

export default function UrlEncoderDecoder() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('encode'); // 'encode' or 'decode'

    const handleProcess = () => {
        try {
            if (mode === 'encode') {
                setInput(encodeURIComponent(input));
            } else {
                setInput(decodeURIComponent(input));
            }
        } catch (e) {
            alert("Error processing URL part. Make sure the input is valid for decoding.");
        }
    };

    const handleClear = () => setInput('');

    return (
        <div className="url-tool-page">
            <SEO
                title="URL Encoder & Decoder – Safely Format URL Parameters"
                description="Encode or decode URL parameters and special characters instantly. Perfect for debugging API calls and web addresses."
                keywords="url encoder, url decoder, encodeURIComponent, decodeURIComponent, web developer tools, percent encoding, uri encoder, link sanitizer, url debugger"
                canonicalPath="/url-encoder-decoder"
                ogImage="/og/url-encoder-decoder.png"
                faqItems={[
                    { q: 'Is this tool safe for sensitive data?', a: 'Yes. All encoding and decoding happens locally in your browser JavaScript engine. No data is sent to our servers.' },
                    { q: 'Which standard does this follow?', a: 'We use the standard ECMAScript encodeURIComponent and decodeURIComponent specifications used across the web.' },
                    { q: 'Can it handle Emojis?', a: 'Absolutely! Modern UTF-8 characters and emojis are fully supported.' }
                ]}
            />

            <ToolHeader
                title="URL Encoder"
                highlight="& Decoder"
                badge="🛠️ Developer Utility"
                desc="Safely transform special characters in your URLs. Encode for query parameters or decode to read hidden data easily."
            />

            <ToolGrid>
                <Panel title="Input & Mode">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Btn
                                onClick={() => setMode('encode')}
                                variant={mode === 'encode' ? 'primary' : 'ghost'}
                                full={false}
                            >
                                🔒 Encode Mode
                            </Btn>
                            <Btn
                                onClick={() => setMode('decode')}
                                variant={mode === 'decode' ? 'primary' : 'ghost'}
                                full={false}
                            >
                                🔓 Decode Mode
                            </Btn>
                        </div>

                        <textarea
                            className="modern-input"
                            style={{ minHeight: '200px', fontFamily: 'var(--font-mono)' }}
                            placeholder={mode === 'encode' ? "Enter text to encode (e.g. hello world!)" : "Enter text to decode (e.g. hello%20world!)"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Btn onClick={handleProcess} disabled={!input.trim()}>
                                {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
                            </Btn>
                            <Btn onClick={handleClear} variant="ghost" full={false}>
                                <Trash2 size={18} />
                            </Btn>
                        </div>
                    </div>
                </Panel>

                <Panel title="What is URL Encoding?">
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <p>URL encoding converts characters into a format that can be transmitted over the Internet. URLs can only be sent over the Internet using the ASCII character-set.</p>
                        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                            <li><strong>Space:</strong> Becomes %20</li>
                            <li><strong>Special Chars:</strong> !, #, $, %, & are replaced by hex codes.</li>
                            <li><strong>Safety:</strong> Ensures that query parameters don't break the actual URL structure.</li>
                        </ul>
                    </div>
                </Panel>
            </ToolGrid>

            <AdBanner slot="9999999999" />

            <SEOContent title="How to use the URL Encoder Decoder">
                <p>Developers frequently need to manually encode strings to pass them into <code>GET</code> parameters or <code>API</code> endpoints. This tool provides a clean, private interface to do exactly that.</p>
                <h3>Encoding</h3>
                <p>Switch to <strong>Encode Mode</strong> to transform characters like spaces or emojis into valid URL percent-encoding (e.g., <code>%20</code>).</p>
                <h3>Decoding</h3>
                <p>Switch to <strong>Decode Mode</strong> if you have a messy URL and want to see the actual plain-text values inside the query string or path.</p>
            </SEOContent>

            <FAQ items={[
                { q: "Is this tool safe for sensitive data?", a: "Yes. All encoding and decoding happens locally in your browser's JavaScript engine. No data is sent to our servers." },
                { q: "Which standard does this follow?", a: "We use the standard ECMAScript 'encodeURIComponent' and 'decodeURIComponent' specifications used across the web." },
                { q: "Can it handle Emojis?", a: "Absolutely! Modern UTF-8 characters and emojis are fully supported." }
            ]} />
        </div>
    );
}
