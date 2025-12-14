
export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold mb-8 dark:text-white">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
                    <p>We do not collect personal account information as our service is free and requires no login. We temporarily process files you upload for the sole purpose of providing the requested tools.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">2. File Data Handling</h2>
                    <p>Files uploaded to FileSwift are:</p>
                    <ul className="list-disc pl-5 mb-4">
                        <li>Encrypted in transit.</li>
                        <li>Stored temporarily on secure servers.</li>
                        <li>Automatically deleted within 1 hour of processing.</li>
                        <li>Never shared with third parties.</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6 mb-3">3. Cookies and Analytics</h2>
                    <p>We use essential cookies to ensure site functionality and anonymous analytics (e.g., Google Analytics) to improve our service. Third-party vendors, including Google, use cookies to serve ads based on prior visits.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">4. Contact Us</h2>
                    <p>If you have questions about this Privacy Policy, please contact us via our Contact page.</p>
                </div>
            </div>
        </div>
    );
}
