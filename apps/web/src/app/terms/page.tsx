
export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold mb-8 dark:text-white">Terms of Service</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
                    <p>By accessing and using FileSwift, you accept and agree to be bound by the terms and provision of this agreement.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">2. Usage License</h2>
                    <p>Permission is granted to temporarily use the materials (information or software) on FileSwift's website for personal, non-commercial transitory viewing only.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">3. Disclaimer</h2>
                    <p>The materials on FileSwift's website are provided "as is". FileSwift makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-3">4. Limitations</h2>
                    <p>In no event shall FileSwift or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on FileSwift's website.</p>
                </div>
            </div>
        </div>
    );
}
