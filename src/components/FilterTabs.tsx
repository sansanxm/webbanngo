
import React from 'react';

interface FilterTabsProps {
    tabs: string[];
    activeTab: string;
    onChange: (tab: string) => void;
    className?: string;
}

export default function FilterTabs({ tabs, activeTab, onChange, className = "" }: FilterTabsProps) {
    return (
        <div className={`flex flex-wrap justify-center gap-2 md:gap-3 bg-white/80 backdrop-blur-xl p-2 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 max-w-full overflow-hidden ring-8 ring-blue-50/30 ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onChange(tab)}
                    className={`cursor-pointer px-6 md:px-8 py-3 md:py-4 rounded-[2.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${activeTab === tab
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-300 scale-105"
                        : "text-gray-500 hover:text-blue-600 hover:bg-white"
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
