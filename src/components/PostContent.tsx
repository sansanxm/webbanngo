

import { sanitizeContent } from "@/lib/utils";
import DriveImage from "./DriveImage";

interface PostContentProps {
    content: string;
}

function PostImage({ src }: { src: string }) {
    return (
        <div className="my-6">
            <DriveImage
                src={src}
                alt="Ảnh minh họa"
                className="w-full max-w-[75%] mx-auto h-auto rounded-lg shadow-md object-contain block"
                fallback={
                    <div className="my-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-red-500 text-sm mb-2">⚠ Không thể tải hình ảnh</p>
                        <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline text-xs break-all"
                        >
                            {src}
                        </a>
                    </div>
                }
            />
        </div>
    );
}

export default function PostContent({ content }: PostContentProps) {
    // Decode entities just in case Firestore/Textarea stored them encoded
    const cleanContent = sanitizeContent(content)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Split by [img: url] pattern
    const parts = cleanContent.split(/\[img:\s*(.*?)\]/g);

    return (
        <div
            className="prose dark:prose-invert prose-lg text-[18px] max-w-none text-gray-800 dark:text-gray-200 leading-[1.8] whitespace-pre-wrap text-justify break-words hyphens-none"
            style={{ tabSize: '1.27cm' } as React.CSSProperties}
        >
            {parts.map((part, index) => {
                // Even indices are text, Odd indices are URLs (from capturing group)
                if (index % 2 === 0) {
                    if (!part) return null;
                    // Render HTML for text parts so <b> <i> works
                    return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
                } else {
                    return <PostImage key={index} src={part.trim()} />;
                }
            })}
        </div>
    );
}
