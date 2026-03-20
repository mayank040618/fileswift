'use client';

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { AuthPreview } from "./auth-preview";
import { AuthFeatures } from "./auth-features";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-black">
            {/* Left Panel: Value Preview */}
            <div className="flex flex-col p-8 sm:p-12 lg:p-16 bg-black border-r border-white/5 relative overflow-hidden order-2 lg:order-1">
                {/* Background glow effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
                    {/* Header */}
                    <div className="mb-10 mt-8 lg:mt-0">
                        <Link href="/" className="flex items-center gap-2.5 w-fit group mb-10 transition-opacity hover:opacity-90">
                            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
                                <FileText className="text-white w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                FileSwift<span className="text-blue-400">AI</span>
                            </span>
                        </Link>
                        
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
                            AI Workspace for PDFs, Images & Documents
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium mt-4">
                            Convert, compress, analyze and understand documents with AI.
                        </p>
                    </div>

                    {/* Product Preview Card */}
                    <AuthPreview />

                    <div className="flex-grow min-h-[3rem]" />

                    {/* Feature List */}
                    <AuthFeatures />
                    
                    <div className="mt-16 text-sm text-slate-500 font-medium hidden lg:block">
                        © {new Date().getFullYear()} FileSwiftAI. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-white dark:bg-black order-1 lg:order-2 flex-grow min-h-screen lg:min-h-0">
                {/* Back to Home Navigation */}
                <Link 
                    href="/" 
                    className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors z-20"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Mobile Background Glow for right side */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-[100px] pointer-events-none block lg:hidden" />
                
                {/* Desktop Background Glow & Animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-transparent dark:to-transparent pointer-events-none" />
                
                {/* Animated Background Blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none hidden lg:block">
                    <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
                    <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob [animation-delay:2s]" />
                    <div className="absolute bottom-[20%] left-[30%] w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob [animation-delay:4s]" />
                </div>

                {/* Subtle static glow directly behind the card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none hidden lg:block" />

                <div className="w-full max-w-[460px] z-10 relative">
                    {children}
                </div>
            </div>
        </div>
    );
}
