export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Terms of Service</h1>
                <p className="text-sm text-slate-500 mb-8">Last Updated: December 12, 2025</p>

                <p>
                    By using FileSwift, you agree to these Terms. Please read them carefully.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Usage Rights</h2>
                <p>
                    You may use FileSwift for personal and commercial file processing. You agree NOT to upload:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Illegal content or malware.</li>
                    <li>Copyrighted material necessary authorization.</li>
                    <li>Files that violate any laws.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Liability Limitation</h2>
                <p>
                    FileSwift is provided "as is". We are not liable for any data loss, file corruption, or damages resulting from the use of our service.
                    Please always keep a backup of your original files.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Retention</h2>
                <p>
                    Files uploaded to our servers are automatically deleted after 1 hour to ensure privacy. We cannot recover files once they are deleted.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Changes to Terms</h2>
                <p>
                    We reserve the right to modify these terms at any time. Continued use of the service constitutes usage of the new terms.
                </p>
            </div>
        </div>
    );
}
