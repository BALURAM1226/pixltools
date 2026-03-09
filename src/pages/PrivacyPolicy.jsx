import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function PrivacyPolicy() {
    const lastUpdated = "February 27, 2026";

    return (
        <div className="legal-page">
            <SEO
                title="Privacy Policy – Secure & Local Data Processing"
                description="Read the iLoveToolHub Privacy Policy. Your files never leave your device. Learn how we protect your privacy through local, in-browser processing."
                canonicalPath="/privacy-policy"
                ogImage="/og/og.jpg"
            />

            <header className="legal-header">
                <span className="legal-eyebrow">Data Security</span>
                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-sub">Effective Date: {lastUpdated}</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>1. Introduction</h2>
                    <p>At iLoveToolHub ("we," "our," or "the website"), we recognize that your privacy is of paramount importance. This Privacy Policy describes how we collect, use, and protect your information when you visit <strong>ilovetoolhub.com</strong>.</p>
                </section>

                <section>
                    <h2>2. The "No-Upload" Guarantee</h2>
                    <p>Unlike most online utility websites, iLoveToolHub is built on a <strong>client-side architecture</strong>. This means:</p>
                    <ul>
                        <li><strong>Local Processing:</strong> When you use our Image Compressor, PDF Builder, or Background Remover, your files are processed locally in your browser's memory using JavaScript and WebAssembly.</li>
                        <li><strong>No Server Storage:</strong> Your images, documents, and sensitive biometric photos are <strong>NEVER</strong> uploaded to our servers or third-party cloud storage.</li>
                        <li><strong>Zero Data Persistence:</strong> Once you close your browser tab, all session data associated with your processed files is permanently cleared from your device's memory.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Information We Collect</h2>
                    <p>While we do not access your files, we collect minimal, non-personally identifiable information through standard web technologies:</p>
                    <ul>
                        <li><strong>Analytics:</strong> We use Google Analytics to track general usage statistics, such as which tools are used most frequently and geographic trends. This helps us improve our service.</li>
                        <li><strong>Cookies & AdSense:</strong> We use Google AdSense to serve advertisements. Google may use cookies to serve ads based on your visit history. You can opt-out of personalized advertising through your Google account settings.</li>
                        <li><strong>Local Preferences:</strong> We use your browser's <code>localStorage</code> to remember your theme preference (Dark/Light mode).</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Security</h2>
                    <p>By eliminating the "upload" step, we have removed the single largest security risk in online utilities. Because your data remains on your physical hardware, it cannot be intercepted during transmission or stolen from a central database.</p>
                </section>

                <section>
                    <h2>5. Contact Us</h2>
                    <p>If you have any questions regarding our privacy practices or the technology we use to keep your files safe, please contact our privacy officer at:</p>
                    <p className="legal-contact-box"><strong>Email:</strong> <a href="mailto:privacy@ilovetoolhub.com">privacy@ilovetoolhub.com</a></p>
                </section>
            </div>
        </div>
    );
}
