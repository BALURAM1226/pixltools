import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function Terms() {
    const lastUpdated = "February 26, 2026";

    return (
        <div className="legal-page">
            <SEO
                title="Terms & Conditions – Rules for iLoveToolHub"
                description="Read the terms of service for iLoveToolHub. Fair rules for using our free online utility tools."
                canonicalPath="/terms"
            />

            <header className="legal-header">
                <h1 className="legal-title">Terms & Conditions</h1>
                <p className="legal-sub">Last updated: {lastUpdated}</p>
            </header>

            <div className="legal-content">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using iLoveToolHub.com, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

                <h2>2. Use of Service</h2>
                <p>iLoveToolHub provides free online utility tools. You are granted a non-exclusive, non-transferable right to use these tools for personal or commercial purposes, provided your use is legal and does not interfere with the site's operation.</p>

                <h2>3. Intellectual Property</h2>
                <p>The code, design, and branding of iLoveToolHub are the intellectual property of the site owners. You may not copy, replicate, or resell the underlying code of this platform without explicit permission.</p>

                <h2>4. User Privacy & Security</h2>
                <p>Since all processing happens on your local device, you are responsible for the security of your own machine. We do not store, view, or share the files you process on our platform.</p>

                <h2>5. Prohibited Conduct</h2>
                <p>Users are prohibited from:</p>
                <ul>
                    <li>Attempting to hack, disrupt, or compromise the website.</li>
                    <li>Using automation scripts to scrape the site or abuse its resources.</li>
                    <li>Using the tools to process illegal material.</li>
                </ul>

                <h2>6. Disclaimer of Warranties</h2>
                <p>The services are provided "as is" and "as available." While we strive for perfection, we do not guarantee that the tools will Always be error-free or meet every specific requirement you have.</p>

                <h2>7. Limitation of Liability</h2>
                <p>iLoveToolHub and its creators shall not be liable for any direct or indirect damages arising out of your use or inability to use the tools provided on this platform.</p>

                <h2>8. Contact</h2>
                <p>For inquiries regarding these terms, please email <strong>legal@ilovetoolhub.com</strong>.</p>
            </div>
        </div>
    );
}
