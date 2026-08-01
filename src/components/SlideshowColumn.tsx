"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SlideshowColumnProps<T> {
    title: string;
    icon?: React.ReactNode;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    emptyMessage: string;
    viewAllHref: string;
    themeColor: "blue" | "green" | "orange" | "yellow" | "red" | "purple";
    className?: string;
    interval?: number;
}

export default function SlideshowColumn<T>({
    title,
    icon,
    items,
    renderItem,
    emptyMessage,
    viewAllHref,
    themeColor,
    className,
    interval = 5000,
}: SlideshowColumnProps<T>) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Theme classes mapping
    const themeClasses = {
        blue: {
            bg: "bg-blue-50/50",
            headerBg: "bg-blue-600",
            text: "text-blue-600",
            border: "border-blue-100",
        },
        green: {
            bg: "bg-green-50/50",
            headerBg: "bg-green-600",
            text: "text-green-600",
            border: "border-green-100",
        },
        orange: {
            bg: "bg-orange-50/50",
            headerBg: "bg-orange-600",
            text: "text-orange-600",
            border: "border-orange-100",
        },
        yellow: {
            bg: "bg-yellow-50/50",
            headerBg: "bg-yellow-500",
            text: "text-yellow-600",
            border: "border-yellow-100",
        },
        red: {
            bg: "bg-red-50/50",
            headerBg: "bg-red-600",
            text: "text-red-600",
            border: "border-red-100",
        },
        purple: {
            bg: "bg-purple-50/50",
            headerBg: "bg-purple-600",
            text: "text-purple-600",
            border: "border-purple-100",
        }
    };

    const theme = themeClasses[themeColor];

    useEffect(() => {
        if (items.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, interval);

        return () => clearInterval(timer);
    }, [items, interval]);

    return (
        <div className={`flex flex-col rounded-3xl overflow-hidden shadow-lg border ${theme.border} bg-white relative group/col transition-all duration-300 hover:shadow-xl ${className || "h-[500px]"}`}>
            {/* Header */}
            <div className={`${theme.headerBg} px-5 py-4 text-white flex items-center justify-between z-20 shadow-md`}>
                <div className="flex items-center gap-2 font-black text-lg uppercase tracking-wide">
                    {icon}
                    <h3>{title}</h3>
                </div>
                <Link href={viewAllHref} className="text-white/90 hover:text-white text-xs font-bold flex items-center gap-1 group transition-colors uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 z-30 relative shrink-0">
                    Xem tất cả
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            {/* Content Container */}
            <div className={`flex-1 overflow-hidden relative ${theme.bg}`}>
                {items.length > 0 ? (
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={currentIndex}
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 p-4 w-full h-full"
                        >
                            <div className="w-full h-full relative z-10">
                                {renderItem(items[currentIndex], currentIndex)}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                        <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>

            {/* Progress Bar Container (Removed per user request) */}

            {/* Dots Indicator */}
            {items.length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 pointer-events-auto">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? theme.headerBg + " w-6" : theme.headerBg + " bg-opacity-30 hover:bg-opacity-60"}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
