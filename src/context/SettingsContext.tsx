"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SystemSettings {
    bannerUrl?: string;
    bannerImages?: string[]; // Array of image URLs for slideshow
    schoolName?: string;
    email?: string;
    phone?: string;
    address?: string;
    facebookUrl?: string;
    mapUrl?: string;
    geminiApiKey?: string;
    principalName?: string;
    vicePrincipalName?: string;
    principalImageUrl?: string;
    principalMessage?: string;
    zaloQrUrl?: string;
}

interface SettingsContextType {
    settings: SystemSettings;
    loading: boolean;
}

const defaultSettings: SystemSettings = {
    bannerUrl: "",
    bannerImages: [],
    schoolName: "Trường PTDTBT Tiểu Học Bản Ngò",
    principalName: "Cô Nông Thị Lượng",
    vicePrincipalName: "Cô Phạm Thị Ngân Thuỷ",
    principalMessage: "Chào mừng các em học sinh thân yêu đến với ngôi nhà thứ hai của chúng ta. Nơi đây, các em sẽ được học tập, vui chơi và trưởng thành mỗi ngày.",
    email: "c1bngo.xinman@hagiang.edu.vn",
    phone: "097.1986.343",
    address: "Thôn Táo Thượng, xã Pà Vầy Sủ, tỉnh Tuyên Quang",
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(doc(db, "settings", "general"), (doc) => {
            if (doc.exists()) {
                setSettings({ ...defaultSettings, ...doc.data() });
            } else {
                // Initialize default if not exists? Or just keep default state.
                // We could creating it here, but maybe Admin page handles creation.
                console.log("No settings found, using defaults");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching settings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
