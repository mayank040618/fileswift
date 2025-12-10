'use client';

import { Check } from 'lucide-react';

export function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Upgrade to Pro</h2>
                    <p className="text-slate-600 mt-2">Unlock unlimited access and faster processing.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={16} /></div>
                        <span className="text-slate-700">Unlimited file size</span>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={16} /></div>
                        <span className="text-slate-700">Priority processing queue</span>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={16} /></div>
                        <span className="text-slate-700">No hourly limits</span>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={16} /></div>
                        <span className="text-slate-700">Zero ads</span>
                    </div>
                </div>

                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                    Start Pro Trial ($9/mo)
                </button>

                <p className="mt-4 text-xs text-center text-slate-500">
                    Secure payment via Stripe. Cancel anytime.
                </p>
            </div>
        </div>
    );
}
