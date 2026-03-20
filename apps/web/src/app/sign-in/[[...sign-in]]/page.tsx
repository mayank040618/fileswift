import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign In - FileSwiftAI",
    description: "Sign in to your FileSwiftAI account to access premium AI tools.",
};

export default function SignInPage() {
    return (
        <AuthLayout>
            <div className="w-full flex flex-col items-center">
                <SignIn 
                    localization={{
                        socialButtonsBlockButton: "Continue with {{provider|titleize}}",
                    }}
                    appearance={{
                        layout: {
                            socialButtonsPlacement: 'top',
                            socialButtonsVariant: 'blockButton',
                        },
                        elements: {
                            rootBox: "w-full",
                            card: "bg-white dark:bg-[#0f1117] shadow-2xl shadow-blue-500/5 border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-[460px] mx-auto",
                            headerTitle: "text-slate-900 dark:text-white font-bold text-2xl tracking-tight mb-2",
                            headerSubtitle: "text-slate-500 dark:text-slate-400 font-medium",
                            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-all shadow-blue-500/20 hover:shadow-blue-500/30",
                            formFieldLabel: "text-slate-700 dark:text-slate-300 font-semibold mb-1.5",
                            formFieldInput: "bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 rounded-xl py-2.5 transition-all outline-none",
                            dividerText: "text-slate-400 font-medium tracking-wide",
                            dividerRow: "my-6",
                            dividerLine: "bg-slate-200 dark:bg-slate-800",
                            socialButtonsBlockButton: "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl py-2.5 transition-all outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 font-semibold",
                            socialButtonsBlockButtonText: "font-semibold flex-grow text-center",
                            footer: "hidden",
                            formFieldAction: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium",
                        }
                    }}
                />
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
                    Secure authentication powered by Clerk
                </div>
            </div>
        </AuthLayout>
    );
}
