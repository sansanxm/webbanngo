"use client";

import { useMemo } from "react";

interface EmbeddedLinkProps {
    url?: string;
}

export default function EmbeddedLink({ url }: EmbeddedLinkProps) {
    const embedType = useMemo(() => {
        if (!url) return null;

        // YouTube (including Shorts)
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch && youtubeMatch[1]) {
            return { type: 'youtube', id: youtubeMatch[1] };
        }

        // Vimeo
        const vimeoRegex = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            return { type: 'vimeo', id: vimeoMatch[1] };
        }

        // Google Drive Video
        // Matches forms like: https://drive.google.com/file/d/1x.../view
        const gdriveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
        const gdriveMatch = url.match(gdriveRegex);
        if (gdriveMatch && gdriveMatch[1]) {
            return { type: 'gdrive', id: gdriveMatch[1] };
        }

        return { type: 'generic', url };
    }, [url]);

    if (!url || !embedType) return null;

    if (embedType.type === 'youtube') {
        return (
            <div className="my-6 aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${embedType.id}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                ></iframe>
            </div>
        );
    }

    if (embedType.type === 'vimeo') {
        return (
            <div className="my-6 aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                    src={`https://player.vimeo.com/video/${embedType.id}`}
                    width="100%"
                    height="100%"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                ></iframe>
            </div>
        );
    }

    if (embedType.type === 'gdrive') {
        return (
            <div className="my-6 aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                    src={`https://drive.google.com/file/d/${embedType.id}/preview`}
                    width="100%"
                    height="100%"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                ></iframe>
            </div>
        );
    }

    return (
        <div className="my-6">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
                <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                            Liên kết đính kèm
                        </h4>
                        <p className="text-xs text-gray-500 truncate font-mono mt-1">
                            {url}
                        </p>
                    </div>
                    <div className="text-gray-400">
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </a>
        </div>
    );
}
