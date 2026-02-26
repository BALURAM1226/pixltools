import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, canonicalPath }) {
    const siteUrl = "https://pixltools.vercel.app"; // Change to your actual domain
    const fullCanonical = `${siteUrl}${canonicalPath || ""}`;
    const fullTitle = `${title} | PixlTools`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${siteUrl}/og-image.png`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullCanonical} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        </Helmet>
    );
}
