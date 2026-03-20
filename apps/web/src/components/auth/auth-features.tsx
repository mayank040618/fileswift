import { Activity, Fingerprint, BrainCircuit } from "lucide-react";

export function AuthFeatures() {
    const features = [
        {
            icon: <Activity className="w-5 h-5 text-blue-400" />,
            title: "Lightning Fast",
            description: "Process documents instantly.",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            icon: <Fingerprint className="w-5 h-5 text-purple-400" />,
            title: "Secure & Private",
            description: "Files are encrypted and automatically deleted.",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            icon: <BrainCircuit className="w-5 h-5 text-indigo-400" />,
            title: "AI-Powered Insights",
            description: "Summarize and analyze documents with AI.",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        }
    ];

    return (
        <div className="space-y-4 mt-12 w-full max-w-sm">
            {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/10 hover:border-white/10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${feature.bg} ${feature.border}`}>
                        {feature.icon}
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-base">{feature.title}</h4>
                        <p className="text-sm text-slate-400 mt-0.5 leading-snug">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
