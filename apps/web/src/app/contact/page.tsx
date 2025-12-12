import { Mail } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">Contact Us</h1>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
                    We are here to help. If you have any questions regarding our tools, advertising, or privacy, please don't hesitate to reach out.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Support */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Email Us</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">for general support & feedback</p>
                        <a href="mailto:support@fileswift.com" className="text-blue-600 font-medium hover:underline">
                            support@fileswift.com
                        </a>
                    </div>

                    {/* Business/Legal */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Business Inquiries</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">for advertising & partnerships</p>
                        <a href="mailto:business@fileswift.com" className="text-amber-600 font-medium hover:underline">
                            business@fileswift.com
                        </a>
                    </div>
                </div>

                <div className="mt-16 text-center text-sm text-slate-500">
                    <p>Response time: Usually within 24-48 hours.</p>
                </div>
            </div>
        </div>
    );
}
