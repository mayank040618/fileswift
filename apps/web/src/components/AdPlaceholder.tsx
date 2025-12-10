export function AdPlaceholder({ className }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg p-4 ${className}`}>
            <div className="text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Advertisement</p>
                <div className="w-full h-full min-h-[100px] min-w-[300px] bg-slate-200 rounded flex items-center justify-center text-slate-400 text-sm">
                    Ad Space
                </div>
            </div>
        </div>
    );
}
