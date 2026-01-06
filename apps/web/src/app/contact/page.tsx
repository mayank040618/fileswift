
export default function Contact(): JSX.Element {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <h1 className="text-3xl font-bold mb-6 dark:text-white">Contact Us</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Have questions or feedback? We'd love to hear from you.
                </p>
                <div className="space-y-4">
                    <p className="text-lg">
                        <strong>Email:</strong> <a href="mailto:support@fileswift.in" className="text-blue-600 hover:underline">support@fileswift.in</a>
                    </p>
                    <p className="text-sm text-slate-500">
                        We aim to respond to all inquiries within 24-48 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
