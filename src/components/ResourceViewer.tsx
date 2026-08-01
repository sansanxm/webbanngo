"use client";

import { useState } from "react";
import BannerSlideshow from "./BannerSlideshow";
import DriveImage from "./DriveImage";

interface ResourceViewerProps {
    type: "single" | "folder" | "slideshow";
    link: string;
    links?: string[];
    category: string;
}

export default function ResourceViewer({ type, link, links, category }: ResourceViewerProps) {
    const [viewMode, setViewMode] = useState<"slideshow" | "gallery">(type === "slideshow" ? "slideshow" : "gallery");
    const [currentIndex, setCurrentIndex] = useState(0);

    const extractFolderId = (url: string) => {
        const match = url.match(/\/folders\/(.+?)(\?|$|\/)/) || url.match(/id=(.+?)(&|$)/);
        return match ? match[1] : null;
    };

    const extractYoutubeId = (url: string) => {
        const match = url.match(/(?:\?v=|&v=|youtu\.be\/|\/embed\/|\/watch\?v=)([^#\&\?]*)/);
        return match && match[1].length === 11 ? match[1] : null;
    };

    const extractFileId = (url: string) => {
        const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        return match ? match[1] : null;
    };

    const getDownloadUrl = (url: string) => {
        const id = extractFileId(url);
        return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
    };

    const isDirectPdf = (url: string) => url.toLowerCase().endsWith(".pdf");
    const isDriveLink = (url: string) => url.includes("drive.google.com");

    const getDriveEmbedUrl = (url: string) => {
        if (url.includes("/view")) {
            return url.replace("/view", "/preview");
        }
        if (url.includes("id=")) {
            const id = url.split("id=")[1].split("&")[0];
            return `https://drive.google.com/file/d/${id}/preview`;
        }
        return url;
    };

    const handleNext = () => {
        if (links && links.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % links.length);
        }
    };

    const handlePrev = () => {
        if (links && links.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + links.length) % links.length);
        }
    };

    if (type === "folder") {
        const folderId = extractFolderId(link);
        if (!folderId) return <div className="text-white p-4">Link thư mục không hợp lệ</div>;
        return (
            <iframe
                src={`https://drive.google.com/embeddedfolderview?id=${folderId}#grid`}
                className="w-full h-full border-0"
                allow="autoplay"
                loading="lazy"
            />
        );
    }

    if (type === "slideshow" && links && links.length > 0) {
        return (
            <div className="relative w-full h-full flex flex-col bg-black">
                {/* Toggle Controls */}
                <div className="absolute top-4 right-4 z-50 flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                    <button
                        onClick={() => setViewMode("slideshow")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "slideshow" ? "bg-white text-blue-600 shadow-lg" : "text-white hover:bg-white/10"}`}
                    >
                        CHẠY TỰ ĐỘNG
                    </button>
                    <button
                        onClick={() => setViewMode("gallery")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "gallery" ? "bg-white text-blue-600 shadow-lg" : "text-white hover:bg-white/10"}`}
                    >
                        THỰC VIỆN (TẢI ẢNH)
                    </button>
                </div>

                <div className="flex-1 relative overflow-hidden">
                    {viewMode === "slideshow" ? (
                        <BannerSlideshow images={links} />
                    ) : (
                        <div className="w-full h-full relative group">
                            <DriveImage
                                src={links[currentIndex]}
                                alt={`Gallery ${currentIndex + 1}`}
                                className="w-full h-full object-contain"
                            />

                            {/* Navigation Buttons */}
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl group/btn"
                            >
                                <svg className="w-6 h-6 -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl group/btn"
                            >
                                <svg className="w-6 h-6 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            {/* Download & Counter Info Overlay */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                                <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-black tracking-widest border border-white/20">
                                    {currentIndex + 1} / {links.length}
                                </div>
                                <a
                                    href={getDownloadUrl(links[currentIndex])}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-2xl font-black text-sm transition-all shadow-2xl group/dl"
                                >
                                    <svg className="w-5 h-5 group-hover/dl:bounce transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    TẢI ẢNH NÀY VỀ MÁY
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default "single" mode processing
    const ytId = extractYoutubeId(link);
    if (ytId) {
        return (
            <iframe
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        );
    }

    if (isDriveLink(link)) {
        return (
            <iframe
                src={getDriveEmbedUrl(link)}
                className="w-full h-full border-0"
                allow="autoplay"
                loading="lazy"
            />
        );
    }

    if (isDirectPdf(link)) {
        return (
            <iframe
                src={link}
                className="w-full h-full border-0"
                loading="lazy"
            />
        );
    }

    return (
        <iframe
            src={link}
            className="w-full h-full border-0 bg-white"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; display-capture"
        />
    );
}
