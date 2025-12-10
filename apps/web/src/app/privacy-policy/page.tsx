import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto max-w-3xl px-6 py-12">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose dark:prose-invert">
                <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <h3>1. Introduction</h3>
                <p>Welcome to FileSwift. We respect your privacy and are committed to protecting your personal data.</p>

                <h3>2. Data Collection</h3>
                <p>We do NOT store your uploaded files permanently. All files uploaded for processing are automatically deleted from our servers within 1 hour after processing is complete.</p>

                <h3>3. Cookies and Advertising</h3>
                <p>We use third-party vendors, including Google, which use cookies to serve ads based on a user's prior visits to our website or other websites.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
                    <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="nofollow noopener noreferrer" className="text-blue-500 hover:underline">Google Ads Settings</a>.</li>
                </ul>

                <h3>4. Analytics</h3>
                <p>We use Google Analytics to understand how our website is used. This service collects data anonymously (e.g., page views, session duration).</p>

                <h3>5. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us.</p>
            </div>
        </div>
    );
}
