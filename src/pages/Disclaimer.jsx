import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function Disclaimer() {
    const lastUpdated = "February 27, 2026";

    return (
        <div className="legal-page">
            <SEO
                title="Disclaimer – Use of Service & Liability"
                description="Official disclaimer for iLoveToolHub. Understanding the limitations, accuracy guarantees, and liabilities when using our online utility tools."
                canonicalPath="/disclaimer"
                ogImage="/og/og.jpg"
            />

            <header className="legal-header">
                <span className="legal-eyebrow">Legal Limits</span>
                <h1 className="legal-title">Disclaimer</h1>
                <p className="legal-sub">Effective Date: {lastUpdated}</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>1. Accuracy of Results</h2>
                    <p>The tools provided on iLoveToolHub (including but not limited to Image Converters, OCR, and AI Background Removers) rely on automated algorithms and high-performance libraries. While we strive to provide 100% accurate results, we cannot guarantee perfection. Users are responsible for reviewing and verifying the accuracy of output files before using them for official, legal, or professional applications.</p>
                </section>

                <section>
                    <h2>2. No Professional Advice</h2>
                    <p>The information and tools provided on this website are for general informational purposes only. iLoveToolHub does not provide professional legal, financial, or medical advice. Any document generated using our tools should be checked against the official requirements of the respective issuing authority.</p>
                </section>

                <section>
                    <h2>3. Limitation of Liability</h2>
                    <p>iLoveToolHub and its operators shall not be held liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the tools on our website, even if we have been notified of the possibility of such damage.</p>
                </section>

                <section>
                    <h2>4. External Links</h2>
                    <p>Our website may contain links to external sites that are not operated by us. We have no control over the content and nature of these sites and the presence of any links does not necessarily imply a recommendation for the content found within them.</p>
                </section>

                <section>
                    <h2>5. Contact Information</h2>
                    <p>For questions or clarifications regarding this disclaimer, please reach out to our legal team:</p>
                    <p className="legal-contact-box"><strong>Email:</strong> <a href="mailto:legal@ilovetoolhub.com">legal@ilovetoolhub.com</a></p>
                </section>
            </div>
        </div>
    );
}
