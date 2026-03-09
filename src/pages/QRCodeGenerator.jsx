import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Control, Slider, Select, Btn,
    ResetBtn, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import './QRCodeGenerator.css';

export default function QRCodeGenerator() {
    const [value, setValue] = useState('https://ilovetoolhub.com');
    const [size, setSize] = useState(512);
    const [fgColor, setFgColor] = useState('#000000');
    const [level, setLevel] = useState('H');
    const [, setIncludeLogo] = useState(false);
    const [logoBase64, setLogoBase64] = useState(null);
    const [logoPercentage, setLogoPercentage] = useState(20);

    const logoInputRef = useRef(null);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setLogoBase64(event.target.result);
            setIncludeLogo(true);
        };
        reader.readAsDataURL(file);
    };

    const downloadPNG = () => {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-ilovetoolhub.png`;
        link.click();
    };

    const reset = () => {
        setValue('https://ilovetoolhub.com');
        setSize(512);
        setFgColor('#000000');
        setLevel('H');
        setIncludeLogo(false);
        setLogoBase64(null);
    };

    return (
        <div className="qr-page">
            <SEO
                title="Custom QR Code Generator – Create Free High-Quality QR Codes"
                description="Generate professional QR codes for URLs, text, and business cards. Customize colors, add your logo, and download in high resolution. 100% private and free."
                keywords="qr code generator online, create qr code with logo, custom qr code maker, high resolution qr code, free qr code generator, qr code for business, printable qr code for marketing, dynamic qr generator, safe qr code maker"
                canonicalPath="/qr-generator"
                ogImage="/og/qr-generator.jpg"
                faqItems={[
                    { q: 'Can I use these QR codes for commercial work?', a: 'Yes. All QR codes generated here are 100% free and carry no license restrictions. You can use them for products, menus, or marketing campaigns.' },
                    { q: 'Will the logo break the QR code?', a: 'We use high-level (30%) error correction when a logo is added. This ensures the data is still readable by most smartphones despite the visual overlay.' },
                    { q: 'What is the best format for printing?', a: 'For large posters or banners, use the highest size (2048px) and download as PNG. We are working on SVG support for vector enthusiasts.' }
                ]}
            />

            <ToolHeader
                title="QR Code"
                highlight="Generator"
                badge="📱 High Res"
                desc="Create fully customizable QR codes with brand colors and logos. High-quality vector-ready output for print and digital."
            />

            <ToolGrid>
                <Panel title="QR Data & Stylings" className="grid-left">
                    <Control label="QR Content (URL or Text)" id="qr-content">
                        <textarea
                            id="qr-content"
                            className="modern-input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Enter link, text, or data here..."
                            aria-label="Target text or URL for QR code"
                        />
                    </Control>

                    <div className="settings-row" style={{ marginTop: 20 }}>
                        <Control label="Pattern Color" id="qr-color">
                            <div className="color-input-wrap">
                                <input
                                    id="qr-color"
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    aria-label="Pick QR code pattern color"
                                />
                                <span className="custom-hex-code" aria-hidden="true">{fgColor}</span>
                            </div>
                        </Control>
                    </div>

                    <Control label="Resolution (Output)" id="qr-size">
                        <Slider
                            id="qr-size"
                            label="Output image resolution"
                            min={128}
                            max={2048}
                            step={64}
                            value={size}
                            onChange={setSize}
                            formatValue={v => `${v}×${v} px`}
                        />
                    </Control>

                    <Control label="Correction Level (Resilience)" id="qr-level">
                        <Select
                            id="qr-level"
                            label="Error correction level"
                            value={level}
                            options={[
                                { value: 'L', label: 'Low (7%)' },
                                { value: 'M', label: 'Medium (15%)' },
                                { value: 'Q', label: 'Quartile (25%)' },
                                { value: 'H', label: 'High (30%) - Better for logos' },
                            ]}
                            onChange={setLevel}
                        />
                    </Control>

                    <div className="logo-section">
                        <Control label="Brand Logo Overlay" id="logo-file">
                            <div className="logo-group">
                                <input
                                    type="file"
                                    id="logo-file"
                                    ref={logoInputRef}
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    hidden
                                />
                                <button
                                    type="button"
                                    className="logo-upload-trigger"
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    {logoBase64 ? '✨ Change Logo' : '📁 Upload Logo'}
                                </button>
                                {logoBase64 && (
                                    <button
                                        className="logo-remove-btn"
                                        onClick={() => setLogoBase64(null)}
                                        title="Remove Logo"
                                        aria-label="Remove logo overlay"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </Control>

                        {logoBase64 && (
                            <Control label={`Logo Scale: ${logoPercentage}%`} id="logo-scale">
                                <Slider
                                    id="logo-scale"
                                    label="Logo display scale"
                                    min={10} max={35} value={logoPercentage}
                                    onChange={setLogoPercentage}
                                    formatValue={v => `${v}%`}
                                />
                            </Control>
                        )}
                    </div>
                </Panel>

                <Panel title="Live Preview" className="grid-right preview-sticky">
                    <div className="qr-preview-container" style={{ backgroundColor: '#ffffff' }}>
                        <div className="qr-canvas-wrapper" style={{ padding: '20px' }}>
                            <QRCodeCanvas
                                id="qr-canvas"
                                value={value || ' '}
                                size={size}
                                level={level}
                                bgColor="#ffffff"
                                fgColor={fgColor}
                                imageSettings={logoBase64 ? {
                                    src: logoBase64,
                                    height: (size * logoPercentage) / 100,
                                    width: (size * logoPercentage) / 100,
                                    excavate: true,
                                } : undefined}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                        <p className="qr-hint" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                            Preview is scaled for display. Download for full resolution.
                        </p>
                    </div>

                    <div className="meta-footer">
                        <Btn onClick={downloadPNG} variant="success">Download QR Code (PNG)</Btn>
                        <div className="reset-wrap">
                            <ResetBtn onClick={reset} />
                        </div>
                    </div>
                </Panel>
            </ToolGrid>

            <AdBanner slot="9999999999" />

            <SEOContent title="Professional QR Code Generator for Business & Marketing">
                <p>QR codes are essential tools for linking physical marketing materials to your digital presence. iLoveToolHub's free QR Code Generator allows you to create high-resolution, custom-branded codes in seconds.</p>

                <h3>Why Brand Your QR Codes?</h3>
                <p>Standard black and white codes are functional, but custom-colored QR codes with a central logo increase scan rates and brand trust. Our tool gives you full control over the foreground, background, and correction levels, ensuring your codes work even on complex printed surfaces.</p>

                <h3>Key Professional Features</h3>
                <ul>
                    <li><strong>Logo Integration:</strong> Upload your company logo and embed it directly into the QR pattern with automatic background clearance (excavation).</li>
                    <li><strong>High Resolution:</strong> Generate codes up to 2048px—perfect for large-scale print advertising and banners.</li>
                    <li><strong>Error Correction:</strong> Choose between four levels (L, M, Q, H) to ensure readability even if the code is slightly damaged or partially obscured by your logo.</li>
                    <li><strong>Privacy First:</strong> Like all our tools, your QR code content and logos never reach our servers. Everything is generated safely in your browser memory.</li>
                </ul>

                <h3>Best Practices for Scannable Codes</h3>
                <p>1. <strong>High Contrast:</strong> Always ensure the foreground color is much darker than the background.<br />2. <strong>Clear Padding:</strong> Avoid placing text or graphics too close to the edge of the QR code.<br />3. <strong>Test Before Print:</strong> Always test your generated code with multiple mobile apps before committing to a large print run.</p>
            </SEOContent>

            <FAQ items={[
                { q: "Can I use these QR codes for commercial work?", a: "Yes. All QR codes generated here are 100% free and carry no license restrictions. You can use them for products, menus, or marketing campaigns." },
                { q: "Will the logo break the QR code?", a: "We use high-level (30%) error correction when a logo is added. This ensures the data is still readable by most smartphones despite the visual overlay." },
                { q: "What is the best format for printing?", a: "For large posters or banners, use the highest size (2048px) and download as PNG. We are working on SVG support for vector enthusiasts." }
            ]} />
        </div >
    );
}
