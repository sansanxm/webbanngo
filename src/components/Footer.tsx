"use client";
import { useSettings } from "@/context/SettingsContext";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import NotificationSubscribe from "./NotificationSubscribe";
import { db } from "@/lib/firebase";

export default function Footer() {
    const { settings } = useSettings();
    const [visits, setVisits] = useState<number>(0);

    useEffect(() => {
        const updateVisits = async () => {
            const statsRef = doc(db, "system_stats", "general");
            const viewedKey = "visited_site";

            try {
                // Ensure document exists
                const docSnap = await getDoc(statsRef);
                if (!docSnap.exists()) {
                    await setDoc(statsRef, { totalVisits: 0 }, { merge: true });
                } else {
                    setVisits(docSnap.data().totalVisits || 0);
                }

                // Increment if new session
                if (!sessionStorage.getItem(viewedKey)) {
                    await updateDoc(statsRef, {
                        totalVisits: increment(1)
                    });
                    setVisits(prev => prev + 1);
                    sessionStorage.setItem(viewedKey, "true");
                }
            } catch (error) {
                console.error("Error updating visits:", error);
            }
        };

        updateVisits();
    }, []);

    return (
        <footer className="bg-gray-900 text-white mt-8 pt-6 pb-4 border-t border-gray-800">
            <NotificationSubscribe />
            <div className="max-w-6xl mx-auto px-4 py-2">
                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-10 items-start">
                    {/* Column 1: School Info */}
                    <div className="flex-1 max-w-xl">
                        <h3 className="text-lg font-bold mb-2 text-blue-400 uppercase tracking-wider">{settings.schoolName || "Trường PTDTBT TH&THCS Bản Ngò"}</h3>
                        <p className="text-gray-300 mb-3 leading-snug text-sm">
                            Nơi nuôi dưỡng tâm hồn, trí tuệ và ước mơ cho các em học sinh vùng cao.
                            Chúng tôi tự hào mang đến môi trường học tập thân thiện và chất lượng.
                        </p>
                        <div className="flex items-center gap-2.5 text-gray-400 mb-1.5 text-sm">
                            <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>{settings.address || "Thôn Bản Ngò, xã Pà Vầy Sủ, tỉnh Tuyên Quang"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-400 mb-1.5 text-sm">
                            <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>{settings.email || "c1bngo.xinman@hagiang.edu.vn"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                            <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>{settings.phone || "097.1986.343"}</span>
                        </div>
                    </div>

                    {/* Column 3: Map or External Links */}
                    <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
                        <h3 className="text-base font-bold mb-2 text-blue-400 uppercase tracking-wider">Bản Đồ</h3>
                        <div className="bg-gray-700 h-32 rounded-lg flex items-center justify-center text-gray-500 shadow-inner overflow-hidden border border-gray-600">
                            {settings.mapUrl ? (
                                <iframe
                                    src={settings.mapUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            ) : (
                                <span className="text-xs p-2 text-center">Bản đồ đang cập nhật.</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-5 pt-3 text-center text-gray-500 text-xs">
                    <p>&copy; {new Date().getFullYear()} {settings.schoolName || "Trường PTDTBT TH&THCS Bản Ngò"} - Thiết kế và phát triển bởi <strong>Xiao System</strong></p>
                    <p className="mt-1 text-[11px] text-gray-600">Lượt truy cập: {visits.toLocaleString()}</p>
                </div>
            </div>
        </footer>truy cập: {visits.toLocaleString()}</p>
                </div>
            </div>
        </footer >
    );
}
