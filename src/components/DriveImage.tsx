"use client";

import { useState, useEffect } from "react";

interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    fallback?: React.ReactNode;
}

export default function DriveImage({ src, alt, className, fallback, ...props }: DriveImageProps) {
    const [effectiveSrc, setEffectiveSrc] = useState(src);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        setEffectiveSrc(src);
        setError(false);
        setRetryCount(0);
    }, [src]);

    const handleError = () => {
        // If it's likely a Drive link that failed, try the thumbnail endpoint as fallback
        if (retryCount === 0 && (effectiveSrc.includes("drive.google.com") || effectiveSrc.includes("googleusercontent.com") || effectiveSrc.includes("google"))) {

            // Extract ID from various formats
            let id = null;

            // Regex to find ID
            const match = effectiveSrc.match(/\/d\/(.+?)\//) || effectiveSrc.match(/id=(.+?)(&|$)/) || effectiveSrc.match(/id\/(.+?)\//);
            if (match) {
                id = match[1];
            } else if (effectiveSrc.includes("id=")) {
                id = effectiveSrc.split("id=")[1].split("&")[0];
            }

            if (id) {
                console.log(`[DriveImage] Retrying with thumbnail for ID: ${id}`);
                // Try switching to thumbnail endpoint
                setEffectiveSrc(`https://drive.google.com/thumbnail?id=${id}&sz=w2000`);
                setRetryCount(1);
                return;
            }
        }

        console.error(`[DriveImage] Failed to load image: ${effectiveSrc}`);
        setError(true);
    };

    if (error) {
        if (fallback) return <>{fallback}</>;
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-8 rounded-lg text-sm ${className}`} style={{ minHeight: '200px' }}>
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p>Không tải được ảnh</p>
            </div>
        );
    }

    return (
        <img
            src={effectiveSrc}
            alt={alt}
            className={className}
            referrerPolicy="no-referrer"
            onError={handleError}
            loading="lazy"
            {...props}
        />
    );
}
