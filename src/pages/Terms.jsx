import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function Terms() {
    const lastUpdated = "February 27, 2026";

    return (
        <div className="legal-page">
            <SEO
                title="Terms of Service – Rules & Regulations"
                description="Read the official Terms of Service for iLoveToolHub. Professional and fair guidelines for using our digital utility platform."
                canonicalPath="/terms"
                ogImage="/og/terms.png"
            />

            <header className="legal-header">
                <span className="legal-eyebrow">User Agreement</span>
                <h1 className="legal-title">Terms & Conditions</h1>
                <p className="legal-sub">Last updated: {lastUpdated}</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using <strong>ilovetoolhub.com</strong>, you agree to be bound by these Terms and Conditions. These terms apply to all visitors, users, and others who access the Service.</p>
                </section>

                <section>
                    <h2>2. Use License</h2>
                    <p>Permission is granted to use iLoveToolHub for personal or commercial utility purposes. You may not:</p>
                    <ul>
                        <li>Attempt to reverse engineer or decompile any software contained on the website.</li>
                        <li>Use automated scripts or bots to access or scrape the Service without authorization.</li>
                        <li>Remove any copyright or other proprietary notations from the materials.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. User Data & Processing</h2>
                    <p>iLoveToolHub operates on a local-processing model. You retain full ownership and responsibility for the images and documents you process. We do not store or claim any rights to the data you manipulate through our tools.</p>
                </section>

                <section>
                    <h2>4. Intellectual Property</h2>
                    <p>The Service and its original content (excluding user-provided data), features, and functionality are and will remain the exclusive property of iLoveToolHub and its licensors.</p>
                </section>

                <section>
                    <h2>5. Termination</h2>
                    <p>We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </section>

                <section>
                    <h2>6. Governing Law</h2>
                    <p>These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.</p>
                </section>

                <section>
                    <h2>7. Contact</h2>
                    <p>Inquiries regarding our terms of service should be directed to our legal department:</p>
                    <p className="legal-contact-box"><strong>Email:</strong> <a href="mailto:legal@ilovetoolhub.com">legal@ilovetoolhub.com</a></p>
                </section>
            </div>
        </div>
    );
}
