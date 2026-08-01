"use client";

import { motion } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";

export default function PhoneButton() {
    const { settings } = useSettings();
    const phone = settings.phone || "097 1986 343";

    if (!phone) return null;

    // Clean phone number for tel: link
    const cleanPhone = phone.replace(/\D/g, "");

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none md:pointer-events-auto"
        >
            <a
                href={`tel:${cleanPhone}`}
                className="pointer-events-auto flex items-center group"
                title={`Gọi ngay: ${phone}`}
            >
                {/* Shake & Pulse Container */}
                <div className="relative">
                    {/* Pulsing rings */}
                    <motion.div
                        className="absolute inset-0 bg-blue-400 rounded-full z-0"
                        animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-blue-400 rounded-full z-0"
                        animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />

                    {/* Shaking Phone Icon */}
                    <motion.div
                        className="relative z-10 w-12 h-12 md:w-14 md:h-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        animate={{
                            rotate: [0, -10, 10, -10, 10, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                        }}
                    >
                        <svg
                            className="w-6 h-6 md:w-7 md:h-7 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2c0-4.8-3.9-8.7-8.7-8.7v2c3.7 0 6.7 3 6.7 6.7z" /><path d="M13 8.3h2c0-1.8-1.5-3.3-3.3-3.3v2c.7 0 1.3.6 1.3 1.3z" />
                        </svg>
                    </motion.div>
                </div>

            </a>
        </motion.div>
    );
}
