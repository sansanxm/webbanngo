"use client";

import { useState, useEffect } from "react";

interface ShareButtonsProps {
    title: string;
    url?: string; // Optional, if not provided, window.location.href will be used
    compact?: boolean;
}

export default function ShareButtons({ title, url, compact = false }: ShareButtonsProps) {
    const [shareUrl, setShareUrl] = useState(url || "");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!url && typeof window !== "undefined") {
            setShareUrl(window.location.href);
        }
    }, [url]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleFacebookShare = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            "_blank",
            "width=600,height=400"
        );
    };

    const handleZaloShare = () => {
        // Zalo often requires mobile app or specific copy-paste flow, 
        // but this link works for Zalo Web or redirects to app
        window.open(
            `https://zalo.me/share/?url=${encodeURIComponent(shareUrl)}`,
            "_blank",
            "width=600,height=400"
        );
    };

    if (!shareUrl) return null;

    return (
        <div className={`flex items-center gap-3 ${compact ? "" : "mt-6 border-t border-gray-100 pt-4"}`}>
            <span className="text-sm font-semibold text-gray-600">Chia sẻ:</span>

            {/* Facebook */}
            <button
                onClick={handleFacebookShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                title="Chia sẻ lên Facebook"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook
            </button>

            {/* Zalo */}
            <button
                onClick={handleZaloShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-full text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm ring-1 ring-white"
                style={{ backgroundColor: "#0068FF" }} // Zalo brand color
                title="Chia sẻ qua Zalo"
            >
                <span className="font-extrabold font-sans">Z</span>
                Zalo
            </button>

            {/* Copy Link */}
            <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold transition-all shadow-sm ${copied
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                title="Sao chép liên kết"
            >
                {copied ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Đã sao chép
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Sao chép Link
                    </>
                )}
            </button>
        </div>
    );
}
