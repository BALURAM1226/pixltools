import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function Disclaimer() {
    const lastUpdated = "February 26, 2026";

    return (
        <div className="legal-page">
            <SEO
                title="Disclaimer – Usage Liability and Results"
                description="Official disclaimer for iLoveToolHub. Understanding the limitations and liabilities when using our web-based tools."
                canonicalPath="/disclaimer"
            />

            <header className="legal-header">
                <h1 className="legal-title">Disclaimer</h1>
                <p className="legal-sub">Last updated: {lastUpdated}</p>
            </header>

            <div className="legal-content">
                <h2>1. Accuracy of Tools</h2>
                <p>The tools provided by iLoveToolHub (including Image Converters, OCR, and AI Background Removers) depend on complex algorithms. While we aim for 100% accuracy, we cannot guarantee that every output will be flawless. It is the user's responsibility to verify the accuracy of the final files before using them for official, legal, or professional purposes.</p>

                <h2>2. No Professional Advice</h2>
                <p>Information provided on iLoveToolHub.com is for general informational purposes only. We do not provide legal, financial, or professional advice. Use of our document or passport photo tools is at your own risk.</p>

                <h2>3. External Links</h2>
                <p>Our website may contain links to external sites that are not operated by us. We have no control over the content and practices of these sites and cannot accept responsibility for their respective privacy policies.</p>

                <h2>4. No Warranty</h2>
                <p>iLoveToolHub makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the website or the tools contained on the website for any purpose.</p>

                <h2>5. Financial and Legal Liability</h2>
                <p>In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.</p>

                <h2>6. Contact</h2>
                <p>If you have any questions about this disclaimer, please contact us at <strong>legal@ilovetoolhub.com</strong>.</p>
            </div>
        </div>
    );
}
