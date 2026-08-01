"use client";

import { useState, useEffect } from "react";
import { getToken, isSupported } from "firebase/messaging";
import { messaging, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";

export default function NotificationSubscribe() {
    const [permission, setPermission] = useState("default"); // default, granted, denied
    const [isSupportedBrowser, setIsSupportedBrowser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false); // Local state to show success

    useEffect(() => {
        // Check browser support
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            isSupported().then(supported => {
                setIsSupportedBrowser(supported);
                if (supported) {
                    setPermission(Notification.permission);
                }
            });
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupportedBrowser) return;

        setLoading(true);
        try {
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult === "granted" && messaging) {
                // Get Token
                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // Optional but recommended
                });


                if (token) {
                    console.log("FCM Token:", token);
                    // Save token to Firestore
                    await setDoc(doc(db, "subscribers", token), {
                        token: token,
                        createdAt: serverTimestamp(),
                        platform: navigator.platform,
                        userAgent: navigator.userAgent,
                        lastActive: serverTimestamp()
                    });
                    setSubscribed(true);

                    // Auto hide success message after 5s
                    setTimeout(() => setSubscribed(false), 5000);
                }
            }
        } catch (error) {
            console.error("Error requesting permission:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isSupportedBrowser) return null; // Don't show if not supported
    if (permission === "denied") return null; // Don't show if denied
    if (permission === "granted" && !subscribed) return null; // Don't show if already granted (unless just subscribed to show success)

    return (
        <div className="fixed bottom-6 left-6 z-40">
            <AnimatePresence>
                {/* Subscribe Button (Show if default permission) */}
                {permission === "default" && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={requestPermission}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center relative group"
                        title="Đăng ký nhận thông báo tin mới"
                    >
                        {loading ? (
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Bấm vào để nhận tin mới
                                </span>
                            </>
                        )}
                        {/* Ping animation */}
                        <span className="absolute top-0 right-0 -mr-1 -mt-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </motion.button>
                )}

                {/* Success Message */}
                {subscribed && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="bg-white border border-green-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 pr-8"
                    >
                        <div className="bg-green-100 text-green-600 p-2 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Đăng ký thành công!</h4>
                            <p className="text-xs text-gray-500">Thầy cô sẽ nhận được thông báo khi có tin mới.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
