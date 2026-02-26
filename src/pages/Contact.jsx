import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function Contact() {
    return (
        <div className="legal-page">
            <SEO
                title="Contact Us – Get in Touch with iLoveToolHub"
                description="Have a question, feedback, or a tool request? Contact the iLoveToolHub team today. We'd love to hear from you."
                canonicalPath="/contact"
            />

            <header className="legal-header">
                <h1 className="legal-title">Contact Us</h1>
                <p className="legal-sub">Have a question or feedback? We'd love to hear from you.</p>
            </header>

            <div className="legal-content">
                <h2>We're Here to Help</h2>
                <p>Whether you've found a bug, want to request a new tool, or just want to say hi, feel free to reach out. Your feedback helps us make iLoveToolHub better for everyone.</p>

                <h2>Email Us</h2>
                <p>The best way to reach us is via email. We aim to respond to all inquiries within 48 hours.</p>

                <div className="contact-card">
                    <div className="contact-icon">✉️</div>
                    <div className="contact-info">
                        <h3>Support & Feedback</h3>
                        <a href="mailto:support@ilovetoolhub.com">support@ilovetoolhub.com</a>
                    </div>
                </div>

                <h2>Social Support</h2>
                <p>You can also reach out to us via our GitHub repository for technical issues, bug reports, and feature requests. We are an open-source friendly project and value community contributions.</p>

                <p>Stay tuned for more ways to connect with us in the future!</p>
            </div>
        </div>
    );
}
