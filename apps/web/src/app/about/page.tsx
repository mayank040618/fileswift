export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">About FileSwift</h1>

                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                    Welcome to <strong>FileSwift</strong>, your go-to solution for fast, secure, and efficient file processing.
                    Our mission is to make advanced document tools accessible to everyone, directly from their browser, without the need for expensive software or subscriptions.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
                <p>
                    FileSwift leverages cutting-edge technology including <strong>WebAssembly</strong> and cloud-based AI to handle your files.
                    Whether you are compressing a massive PDF, converting Word documents, or editing images, our processors ensure pixel-perfect results in milliseconds.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Privacy First</h2>
                <p>
                    We believe your data belongs to you. That's why:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>We do not store your files permanently.</li>
                    <li>All uploads are automatically deleted from our servers after 1 hour.</li>
                    <li>We do not share your documents with third parties.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                <p>
                    Have questions, suggestions, or need support? We'd love to hear from you.
                    Reach out to us via our <a href="/contact" className="text-blue-600 hover:underline">Contact Page</a>.
                </p>
            </div>
        </div>
    );
}
