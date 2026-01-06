
export default function About(): JSX.Element {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">About FileSwift</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                        FileSwift is a privacy-focused, high-performance online file tool suite designed to make document management easy and accessible for everyone.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">Our Mission</h2>
                    <p>To provide fast, secure, and free tools for PDF compression, conversion, and editing without compromising user privacy.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">Why Choose Us?</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Fast:</strong> We process files in parallel using advanced cloud infrastructure.</li>
                        <li><strong>Secure:</strong> Your files are encrypted and automatically deleted.</li>
                        <li><strong>Free:</strong> No hidden costs or premium subscriptions required for basic tools.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
