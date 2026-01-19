
export default function About(): JSX.Element {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">About FileSwift</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                        FileSwift is a free online file tools platform that allows users to compress, convert, and edit PDF and image files directly in the browser. It is designed to provide fast, secure, and privacy-first document processing without requiring software installation or user registration.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">What is FileSwift?</h2>
                    <p>
                        FileSwift is a web-based utility suite optimized for productivity and security. It offers a collection of tools to handle common file tasks such as reducing PDF size for email, converting scanned PDFs to editable Word documents, and resizing images for social media usage.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">Who is FileSwift for?</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Students:</strong> For compressing assignments and converting research papers.</li>
                        <li><strong>Professionals:</strong> For editing contracts, organizing reports, and optimizing shared documents.</li>
                        <li><strong>Content Creators:</strong> For batch resizing images and creating portfolios.</li>
                        <li><strong>Remote Teams:</strong> For quick file manipulation without needing enterprise software.</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6 mb-3">Privacy & Security</h2>
                    <p>
                        We operate on a strict privacy-first policy. FileSwift processes files securely using 256-bit SSL encryption. All uploaded files are automatically and permanently deleted from our servers after 1 hour to ensure user data protection.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">Key Features</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>100% Free:</strong> No hidden charges or subscription walls.</li>
                        <li><strong>No Signup:</strong> Instant access to all tools without creating an account.</li>
                        <li><strong>Browser-Based:</strong> Works on Chrome, Safari, Edge, and Firefox on any operating system (Windows, Mac, Linux, Android, iOS).</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
