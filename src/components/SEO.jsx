import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, canonicalPath, customSchema }) {
    const siteUrl = "https://www.ilovetoolhub.com"; // Your official domain with www
    const fullCanonical = `${siteUrl}${canonicalPath || ""}`;
    const fullTitle = `${title} | iLoveToolHub`;

    const jsonLd = customSchema || {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": fullTitle,
        "url": fullCanonical,
        "description": description,
        "applicationCategory": "MultimediaApplication",
        "browserRequirements": "Requires JavaScript",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Organization",
            "name": "iLoveToolHub",
            "url": siteUrl
        }
    };

    const breadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
            },
            canonicalPath && {
                "@type": "ListItem",
                "position": 2,
                "name": title,
                "item": fullCanonical
            }
        ].filter(Boolean)
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullCanonical} />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>

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
