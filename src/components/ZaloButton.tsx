"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";

export default function ZaloButton() {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const zaloQr = settings.zaloQrUrl;

    if (!zaloQr) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed bottom-[144px] right-6 z-50 pointer-events-none md:pointer-events-auto"
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto flex items-center group relative cursor-pointer"
                    title="Chat Zalo"
                >
                    {/* Shake & Pulse Container */}
                    <div className="relative">
                        {/* Pulsing rings */}
                        <motion.div
                            className="absolute inset-0 bg-blue-500 rounded-full z-0"
                            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.div
                            className="absolute inset-0 bg-blue-500 rounded-full z-0"
                            animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                        />

                        {/* Shaking Icon */}
                        <motion.div
                            className="relative z-10 w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                            animate={{
                                rotate: [0, -10, 10, -10, 10, 0],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut",
                                delay: 1 // Offset from phone/AI
                            }}
                        >
                            <span className="text-white font-black text-[10px] md:text-xs">ZALO</span>
                        </motion.div>
                    </div>
                </button>
            </motion.div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 100 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 max-w-sm w-full border-4 border-white"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-blue-600 mb-1">Kết nối Zalo</h3>
                                <p className="text-gray-500 text-sm">Quét mã QR để chat với nhà trường</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
                                <div className="aspect-square relative rounded-xl overflow-hidden bg-white shadow-inner">
                                    <img
                                        src={zaloQr}
                                        alt="Zalo QR Code"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                            >
                                Đóng
                            </button>

                            {/* Close X top right */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-lg flex items-center justify-center border transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
