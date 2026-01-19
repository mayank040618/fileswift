export default function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://www.fileswift.in/#organization",
                "name": "FileSwift",
                "url": "https://www.fileswift.in",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.fileswift.in/icon.png",
                    "width": 512,
                    "height": 512
                },
                "sameAs": [
                    "https://twitter.com/fileswift",
                    "https://github.com/fileswift"
                ],
                "description": "Free privacy-first online file tools for PDF compression, image resizing, and file conversion."
            },
            {
                "@type": "WebSite",
                "@id": "https://www.fileswift.in/#website",
                "url": "https://www.fileswift.in",
                "name": "FileSwift",
                "publisher": {
                    "@id": "https://www.fileswift.in/#organization"
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.fileswift.in/tools?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
