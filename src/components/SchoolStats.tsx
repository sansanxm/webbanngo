"use client";
import { useSettings } from "@/context/SettingsContext";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Helper component for "Scrambling" number effect
const ScrambleNumber = ({ value }: { value: string }) => {
    const elementRef = useRef<HTMLSpanElement | null>(null);
    const isInView = useInView(elementRef, { once: true, margin: "-10px" });
    const [displayValue, setDisplayValue] = useState("0");
    const [hasSettled, setHasSettled] = useState(false);

    useEffect(() => {
        if (!isInView || hasSettled) return;

        // PARSE: "85+" -> num: 85, suffix: "+"
        // "Mức độ 1" -> num: 1, prefix: "Mức độ "
        const numMatch = value.match(/\d+/);
        if (!numMatch) {
            setDisplayValue(value); // No number? just show it
            setHasSettled(true);
            return;
        }

        const targetNum = parseInt(numMatch[0]);
        const originalString = value;
        const duration = 2000; // 2 seconds scrambling
        const intervalTime = 50; // update every 50ms
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setDisplayValue(originalString);
                setHasSettled(true);
                clearInterval(timer);
            } else {
                // Generate a random number with same length as target
                const random = Math.floor(Math.random() * (targetNum * 1.5));
                // Replace the numeric part in the original string with random
                const scrambled = originalString.replace(/\d+/, random.toString());
                setDisplayValue(scrambled);
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [isInView, value, hasSettled]);

    return <span ref={elementRef}>{displayValue}</span>;
};

export default function SchoolStats() {
    const { settings } = useSettings();
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-10px" });

    // Calculate years of establishment (From 1941)
    const currentYear = new Date().getFullYear();
    const yearsOfHistory = currentYear - 1941;

    const stats = [
        {
            value: `${yearsOfHistory}+`,
            label: "Năm Hình Thành & Phát Triển",
            icon: (
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ),
            color: "from-blue-500 to-blue-600",
            direction: -200 // Pixel value
        },
        {
            value: "Mức độ 1",
            label: "Trường Chuẩn Quốc Gia",
            icon: (
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ),
            color: "from-green-500 to-green-600",
            direction: -200 // Pixel value
        },
        {
            value: "34+",
            label: "Cán Bộ - Giáo Viên - Nhân Viên",
            icon: (
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            ),
            color: "from-orange-500 to-orange-600",
            direction: 200 // Pixel value
        },
        {
            value: "400+",
            label: "Học Sinh Thân Yêu",
            icon: (
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ),
            color: "from-purple-500 to-purple-600",
            direction: 200 // Pixel value
        }
    ];

    return (
        <div ref={containerRef} className="w-full overflow-hidden px-2">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: stat.direction }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: stat.direction }}
                        transition={{
                            duration: 0.5, // Faster action
                            ease: "easeOut",
                            delay: index * 0.1
                        }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300 group"
                    >
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <h3 className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                            <ScrambleNumber value={stat.value} />
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-medium">
                            {stat.label}
                        </p>
                    </motion.div>
                ))}
            </section>
        </div>
    );
}
