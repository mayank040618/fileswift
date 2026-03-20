'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Cpu, FileText, LayoutTemplate, Hourglass, Zap, Maximize, Headset, Sparkles, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

export default function PricingPage() {
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const { isSignedIn, user } = useUser();
    const { userId } = useAuth();
    const router = useRouter();

    // Auto-detect currency based on timezone (simple heuristic)
    useEffect(() => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
            setCurrency('INR');
        } else {
            setCurrency('USD');
        }
    }, []);

    const handleCheckout = async (planId: string) => {
        if (!isSignedIn) {
            toast.error("Please sign in to upgrade");
            router.push('/sign-in?redirect_url=/pricing');
            return;
        }

        setLoadingPlan(planId);
        try {
            if (currency === 'USD') {
                const res = await fetch('/api/lemonsqueezy/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId }),
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            } else {
                // Razorpay Flow
                const res = await fetch('/api/razorpay/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, currency: 'INR' }),
                });
                const order = await res.json();

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "FileSwiftAI",
                    description: `${planId} Subscription`,
                    order_id: order.id,
                    handler: function (response: any) {
                        toast.success("Payment successful! Processing your upgrade...");
                        setTimeout(() => router.push('/workspace'), 2000);
                    },
                    prefill: {
                        name: user?.fullName || "",
                        email: user?.primaryEmailAddress?.emailAddress || "",
                    },
                    theme: {
                        color: "#2563eb",
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Failed to initiate checkout. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-[#0A0A0A] min-h-screen flex flex-col selection:bg-blue-500/30">
            <Header />
            <main className="flex-1 w-full pt-32 pb-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-500">Pricing</h1>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                            AI Tools for PDFs, Images & Documents
                        </p>

                        {/* Currency Toggle */}
                        <div className="mt-10 flex justify-center">
                            <div className="relative flex w-48 rounded-full bg-slate-200/50 dark:bg-white/5 p-1 transition-all">
                                <button
                                    onClick={() => setCurrency('INR')}
                                    className={`relative z-10 w-1/2 rounded-full py-1.5 text-xs font-semibold transition-all ${currency === 'INR' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                                        }`}
                                >
                                    INR (India)
                                </button>
                                <button
                                    onClick={() => setCurrency('USD')}
                                    className={`relative z-10 w-1/2 rounded-full py-1.5 text-xs font-semibold transition-all ${currency === 'USD' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                                        }`}
                                >
                                    USD (Global)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
                        {/* Student Plan */}
                        <div className="rounded-[2rem] p-8 ring-1 ring-slate-200/50 dark:ring-white/5 xl:p-10 bg-white dark:bg-[#111111] shadow-sm relative flex flex-col justify-between transition-shadow hover:shadow-md">
                            <div>
                                <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white">Student</h3>
                                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Perfect for basic document processing and standard AI queries.
                                </p>
                                <div className="mt-8 flex flex-col">
                                    <div className="flex items-baseline gap-x-1">
                                        <span className="text-xl font-medium text-slate-400 line-through">
                                            {currency === 'INR' ? '₹149' : '$4.99'}
                                        </span>
                                        <span className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white ml-2">
                                            {currency === 'INR' ? '₹49' : '$0.99'}
                                        </span>
                                        <span className="text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">/mo</span>
                                    </div>
                                    <p className="text-xs font-semibold text-blue-500 mt-3 uppercase tracking-wider">Early user price</p>
                                </div>

                                <ul role="list" className="mt-8 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    <li className="flex gap-x-3 items-start">
                                        <Cpu className="h-5 w-5 flex-none text-blue-500 mt-0.5" />
                                        50 AI requests per day
                                    </li>
                                    <li className="flex gap-x-3 items-start">
                                        <Hourglass className="h-5 w-5 flex-none text-blue-500 mt-0.5" />
                                        Standard processing speed
                                    </li>
                                    <li className="flex gap-x-3 items-start">
                                        <FileText className="h-5 w-5 flex-none text-blue-500 mt-0.5" />
                                        Standard text extraction
                                    </li>
                                    <li className="flex gap-x-3 items-start">
                                        <LayoutTemplate className="h-5 w-5 flex-none text-blue-500 mt-0.5" />
                                        Clean UI (No Ads or Watermarks)
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleCheckout('student')}
                                disabled={!!loadingPlan}
                                className="mt-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50"
                            >
                                {loadingPlan === 'student' ? <Loader2 className="size-4 animate-spin" /> : 'Get Student Plan'}
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="rounded-[2rem] p-[2px] relative group overflow-hidden lg:scale-105 z-10 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-80" />
                            <div className="relative h-full rounded-[calc(2rem-2px)] p-8 xl:p-10 bg-white dark:bg-[#0A0A0A] flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3 className="text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                                            <Sparkles className="size-5 text-indigo-500" /> Pro Active
                                        </h3>
                                        <div className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                                            Recommended
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                        Uncapped intelligence for power users. Lightning fast and highly capable.
                                    </p>
                                    <div className="mt-8 flex flex-col">
                                        <div className="flex items-baseline gap-x-1">
                                            <span className="text-xl font-medium text-slate-400 dark:text-slate-500 line-through">
                                                {currency === 'INR' ? '₹299' : '$9.99'}
                                            </span>
                                            <span className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white ml-2">
                                                {currency === 'INR' ? '₹149' : '$2.99'}
                                            </span>
                                            <span className="text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">/mo</span>
                                        </div>
                                        <p className="text-xs font-semibold text-indigo-500 mt-3 uppercase tracking-wider">Launch offer</p>
                                    </div>

                                    <ul role="list" className="mt-8 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                        <li className="flex gap-x-3 items-start font-medium text-slate-900 dark:text-white">
                                            <Cpu className="h-5 w-5 flex-none text-indigo-500 mt-0.5" />
                                            500 AI requests per day
                                        </li>
                                        <li className="flex gap-x-3 items-start font-medium text-slate-900 dark:text-white">
                                            <Zap className="h-5 w-5 flex-none text-indigo-500 mt-0.5" />
                                            Lightning fast processing
                                        </li>
                                        <li className="flex gap-x-3 items-start font-medium text-slate-900 dark:text-white">
                                            <Maximize className="h-5 w-5 flex-none text-indigo-500 mt-0.5" />
                                            Maximum context AI model
                                        </li>
                                        <li className="flex gap-x-3 items-start">
                                            <Headset className="h-5 w-5 flex-none text-indigo-500 mt-0.5" />
                                            Priority support
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleCheckout('pro_active')}
                                    disabled={!!loadingPlan}
                                    className="mt-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-medium text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                >
                                    {loadingPlan === 'pro_active' ? <Loader2 className="size-4 animate-spin" /> : 'Upgrade to Pro'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-16 max-w-md text-center sm:max-w-xl lg:max-w-2xl px-4 lg:px-0">
                        <p className="text-[15px] font-medium text-slate-700 dark:text-slate-200 mb-2">
                            🔒 Secure payments • ♻ Cancel anytime • 💳 No hidden fees
                        </p>
                        <p className="text-[15px] text-slate-600 dark:text-slate-400">
                            Used by students, creators, and professionals worldwide.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
            {/* Standard Razorpay script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        </div>
    );
}

