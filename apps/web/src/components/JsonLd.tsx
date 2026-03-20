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
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://www.fileswift.in"
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Is FileSwift really free to use?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! All our tools including PDF Compressor, Image Resizer, and Converters are completely free to use without any limits."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Are my files safe?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Your privacy is our priority. Most conversions happen entirely in your browser (client-side), so your files aren't even uploaded. For cloud tasks, we use SSL encryption and delete files immediately."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Do I need to install any software?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. FileSwift is a cloud-based web application. You can use all our tools directly from your browser on any device (Windows, Mac, iPhone, Android)."
                        }
                    }
                ]
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
