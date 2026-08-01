"use client";

import { useState } from "react";
import Link from "next/link";

interface AnimatedColumnProps<T> {
    title: string;
    icon?: React.ReactNode;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    emptyMessage: string;
    viewAllHref: string;
    themeColor: "blue" | "green" | "orange" | "yellow" | "red" | "purple";
    className?: string;
}

export default function AnimatedColumn<T>({
    title,
    icon,
    items,
    renderItem,
    emptyMessage,
    viewAllHref,
    themeColor,
    className
}: AnimatedColumnProps<T>) {
    const [isHovered, setIsHovered] = useState(false);

    // Theme classes mapping
    const themeClasses = {
        blue: {
            bg: "bg-blue-50/50",
            headerBg: "bg-blue-600",
            text: "text-blue-600",
            border: "border-blue-100",
            gradient: "from-blue-50/50"
        },
        green: {
            bg: "bg-green-50/50",
            headerBg: "bg-green-600",
            text: "text-green-600",
            border: "border-green-100",
            gradient: "from-green-50/50"
        },
        orange: {
            bg: "bg-orange-50/50",
            headerBg: "bg-orange-600",
            text: "text-orange-600",
            border: "border-orange-100",
            gradient: "from-orange-50/50"
        },
        yellow: {
            bg: "bg-yellow-50/50",
            headerBg: "bg-yellow-500",
            text: "text-yellow-600",
            border: "border-yellow-100",
            gradient: "from-yellow-50/50"
        },
        red: {
            bg: "bg-red-50/50",
            headerBg: "bg-red-600",
            text: "text-red-600",
            border: "border-red-100",
            gradient: "from-red-50/50"
        },
        purple: {
            bg: "bg-purple-50/50",
            headerBg: "bg-purple-600",
            text: "text-purple-600",
            border: "border-purple-100",
            gradient: "from-purple-50/50"
        }
    };

    const theme = themeClasses[themeColor];

    // Duplicate items to create a seamless infinite scroll effect
    const displayItems = items.length > 0 ? [...items, ...items] : [];

    // Calculate animation duration based on content height (number of items)
    // Speed: approx 5 seconds per item
    const durationCount = items.length > 0 ? Math.max(20, items.length * 5) : 20;

    return (
        <div className={`flex flex-col rounded-2xl overflow-hidden shadow-lg border ${theme.border} bg-white relative group/col transition-all duration-300 hover:shadow-xl ${className || "h-[500px]"}`}>
            {/* Custom CSS for infinite vertical marquee */}
            <style>{`
                @keyframes marqueeVertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(calc(-50% - 0.5rem)); } /* -50% to scroll half of the duplicated list, minus half the gap */
                }
                .animate-marquee-vertical {
                    animation: marqueeVertical linear infinite;
                }
            `}</style>

            {/* Header */}
            <div className={`${theme.headerBg} px-5 py-4 text-white flex items-center justify-between z-10 shadow-md`}>
                <div className="flex items-center gap-2 font-black text-lg uppercase tracking-wide">
                    {icon}
                    <h3>{title}</h3>
                </div>
                <Link href={viewAllHref} className="text-white/90 hover:text-white text-xs font-bold flex items-center gap-1 group transition-colors uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">
                    Xem tất cả
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            {/* Scrolling Content Container */}
            <div
                className={`flex-1 overflow-hidden relative ${theme.bg}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Gradient Masks for smooth fade-in/out at top and bottom */}
                <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b ${theme.gradient} to-transparent z-10 pointer-events-none`}></div>
                <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${theme.gradient} to-transparent z-10 pointer-events-none`}></div>

                {items.length > 0 ? (
                    <div
                        className="flex flex-col gap-4 p-4 animate-marquee-vertical"
                        style={{
                            animationPlayState: isHovered ? "paused" : "running",
                            animationDuration: `${durationCount}s`
                        }}
                    >
                        {displayItems.map((item, index) => (
                            <div key={index} className="w-full">
                                {renderItem(item, index)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                        <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
