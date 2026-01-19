'use client';

export type TabType = 'instagram' | 'linkedin' | 'twitter' | 'caption';

interface TabSelectorProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'instagram', label: 'Instagram', emoji: '📸' },
    { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
    { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
    { id: 'caption', label: 'Caption', emoji: '✍️' },
];

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2" id="generator">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                    <span className="mr-2">{tab.emoji}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
