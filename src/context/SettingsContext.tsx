"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { DEFAULT_SCHOOL_ID, getSchoolIdFromHost } from "@/lib/school";
import { getTenantDocRef } from "@/lib/firebase-tenant";

interface SystemSettings {
    schoolId?: string;
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
    currentSchoolId: string;
    loading: boolean;
}

const defaultSettings: SystemSettings = {
    schoolId: DEFAULT_SCHOOL_ID,
    bannerUrl: "",
    bannerImages: [],
    schoolName: "Trường PTDTBT TH&THCS Bản Ngò",
    principalName: "Ông Nguyễn Thanh Long",
    vicePrincipalName: "Bà Nông Thị Lượng và Bà Hoàng Thị Ngân",
    principalMessage: "Chào mừng các em học sinh thân yêu đến với ngôi nhà thứ hai của chúng ta. Nơi đây, các em sẽ được học tập, vui chơi và trưởng thành mỗi ngày.",
    email: "c1bngo.xinman@hagiang.edu.vn",
    phone: "097.1986.343",
    address: "Thôn Bản Ngò, xã Pà Vầy Sủ, tỉnh Tuyên Quang",
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    currentSchoolId: DEFAULT_SCHOOL_ID,
    loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const [currentSchoolId, setCurrentSchoolId] = useState<string>(DEFAULT_SCHOOL_ID);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const hostname = window.location.hostname;
        const searchParams = new URLSearchParams(window.location.search);
        const schoolId = getSchoolIdFromHost(hostname, searchParams);
        setCurrentSchoolId(schoolId);

        // Subscribe to tenant-specific settings
        const settingsDocRef = getTenantDocRef(schoolId, "settings", "general");
        const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setSettings({ ...defaultSettings, schoolId, ...docSnap.data() });
            } else {
                setSettings({ ...defaultSettings, schoolId });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error subscribing to settings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, currentSchoolId, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
