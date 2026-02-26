import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function PrivacyPolicy() {
    const lastUpdated = "February 26, 2026";

    return (
        <div className="legal-page">
            <SEO
                title="Privacy Policy – Your Data Stays with You"
                description="Read the iLoveToolHub Privacy Policy. Learn why we are the safest place for your files—because they never leave your browser."
                canonicalPath="/privacy-policy"
            />

            <header className="legal-header">
                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-sub">Last updated: {lastUpdated}</p>
            </header>

            <div className="legal-content">
                <h2>1. Overview</h2>
                <p>At iLoveToolHub, we prioritize your privacy above all else. Our core technology is built around **privacy by design**. This policy explains how we treat your information.</p>

                <h2>2. Data Collection (Files)</h2>
                <p>iLoveToolHub is a **client-side platform**. When you upload an image, PDF, or document to any of our tools:</p>
                <ul>
                    <li><strong>No Server Upload:</strong> Your files are NOT uploaded to any remote server.</li>
                    <li><strong>In-Browser Processing:</strong> All processing is done locally within your browser using JavaScript and WebAssembly.</li>
                    <li><strong>Direct Download:</strong> The processed results go directly from your browser memory to your download folder.</li>
                </ul>

                <h2>3. Analytics and Cookies</h2>
                <p>To improve our service, we use standard analytics tools (like Google Analytics) to collect anonymous traffic data, such as:</p>
                <ul>
                    <li>Which tools are most popular.</li>
                    <li>Browser type and device platform.</li>
                    <li>General geographic region (Country/City).</li>
                </ul>
                <p>These analytics do NOT track your personal files or sensitive information.</p>

                <h2>4. Third-Party Advertising (AdSense)</h2>
                <p>We use Google AdSense to serve ads. Google may use cookies to serve ads based on your visit to this and other websites. These cookies do not allow Google or us to access your local files.</p>

                <h2>5. Local Storage</h2>
                <p>We use your browser's Local Storage solely to save your website preferences, such as your dark/light mode choice (`ilovetoolhub-theme`). This is limited to your device and is not synchronized with any server.</p>

                <h2>6. Security</h2>
                <p>Because your files never leave your device, iLoveToolHub is fundamentally more secure than traditional cloud-based tool sites. You do not need to worry about server breaches or data leaks involving your images.</p>

                <h2>7. Changes to This Policy</h2>
                <p>We may update this policy occasionally. Any changes will be posted on this page with an updated timestamp. Your continued use of the site signifies your agreement to these terms.</p>

                <h2>8. Contact</h2>
                <p>If you have questions about this Privacy Policy, contact us at <strong>privacy@ilovetoolhub.com</strong>.</p>
            </div>
        </div>
    );
}
