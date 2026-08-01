"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface BulletinFormProps {
    initialData?: {
        id?: string;
        title: string;
        content: string;
        category: string;
        imageUrl?: string;
        embeddedLink?: string;
    };
    redirectBaseUrl?: string;
    onDelete?: () => void;
}

export default function BulletinForm({ initialData, redirectBaseUrl = "/admin/bulletin", onDelete }: BulletinFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [embeddedLink, setEmbeddedLink] = useState(initialData?.embeddedLink || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [manualCoverLink, setManualCoverLink] = useState("");

    // Helper to convert Drive Link to Direct Image Link
    const getDriveDirectLink = (url: string) => {
        if (!url) return "";
        // Extract ID from /file/d/ID/view or id=ID
        const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (match && url.includes("drive.google.com")) {
            // Use 'thumbnail' endpoint which is more reliable for hotlinking images than 'uc?export=view'
            // sz=w2000 requests a width of 2000px (high quality)
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
        }
        return url; // Return original if not a Drive link (e.g. standard URL)
    };

    // Helper to resize/compress image
    const resizeAndCompressImage = (file: File | Blob): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 2048;

                    // Resize if too large
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.8 quality
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Compression failed"));
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Helper to process image (convert HEIC if needed)
    const processImage = async (file: File): Promise<File> => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const isHeic = ext === 'heic' || ext === 'heif' || file.type.includes('heic') || file.type.includes('heif');

        let processingFile: File | Blob = file;

        if (isHeic) {
            console.log("Detected HEIC file, converting...");
            setLoading(true); // Ensure loading is on

            try {
                const heic2any = (await import("heic2any")).default;
                const blobOrBlobs = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });
                processingFile = Array.isArray(blobOrBlobs) ? blobOrBlobs[0] : blobOrBlobs;
                console.log("Conversion successful");
            } catch (e) {
                console.error("HEIC conversion failed", e);
                alert("Lỗi chuyển đổi ảnh HEIC: " + (e as any).message); // Fallback alert
                throw new Error("Không thể chuyển đổi ảnh HEIC");
            }
        }

        // Always resize/compress to ensure < 2048px and optimized size
        try {
            console.log("Resizing/Compressing image...");
            const compressedBlob = await resizeAndCompressImage(processingFile);
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            return new File([compressedBlob], newName, { type: "image/jpeg" });
        } catch (error) {
            console.error("Compression failed", error);
            throw new Error("Lỗi tối ưu hóa ảnh");
        }
    };

    const handleContentImageUpload = async (file: File) => {
        try {
            setLoading(true);
            const processedFile = await processImage(file);

            const storageRef = ref(storage, `posts/content/${Date.now()}-${processedFile.name}`);
            const snapshot = await uploadBytes(storageRef, processedFile, {
                contentType: processedFile.type // Explicitly set content type
            });
            const url = await getDownloadURL(snapshot.ref);

            // Insert into textarea
            const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = content;
                const before = text.substring(0, start);
                const after = text.substring(end, text.length);
                const newContent = before + `\n[img: ${url}]\n` + after;
                setContent(newContent);
            } else {
                setContent(content + `\n[img: ${url}]\n`);
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            setError("Tải ảnh thất bại: " + (error.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Bulletins always have category "Thông báo"

            let imageUrl = initialData?.imageUrl || "";

            if (imageFile) {
                const processedFile = await processImage(imageFile);
                const storageRef = ref(storage, `posts/${Date.now()}-${processedFile.name}`);
                const snapshot = await uploadBytes(storageRef, processedFile, {
                    contentType: processedFile.type // Explicitly set content type
                });
                imageUrl = await getDownloadURL(snapshot.ref);
            } else if (manualCoverLink) {
                // Use manual link if no file uploaded but link provided
                imageUrl = getDriveDirectLink(manualCoverLink);
            }

            const postData = {
                title,
                category: "Thông báo",
                content,
                imageUrl,
                embeddedLink,
                date: new Date().toISOString(),
            };

            if (initialData?.id) {
                // If editing, we preserve existing imageUrl if any, or just update fields
                // For now, let's assume we overwrite provided fields. 
                // If we want to keep imageUrl if it existed previously but hidden here, we'd need to merge.
                // But for "Simple Bulletin", we assume no image.
                await updateDoc(doc(db, "posts", initialData.id), postData);
            } else {
                await addDoc(collection(db, "posts"), postData);
            }

            router.push(redirectBaseUrl);
            router.refresh();
        } catch (err: any) {
            console.error("Error saving bulletin:", err);
            setError("Lưu thông báo thất bại: " + (err.message || "Lỗi không xác định"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-yellow-50 p-6 rounded-lg shadow border border-yellow-200">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
                <label className="block text-sm font-bold text-yellow-800 mb-1">Tiêu đề thông báo</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ví dụ: Thông báo nghỉ lễ, Lịch họp phụ huynh..."
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-black font-bold bg-white"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-yellow-800 mb-1">Ảnh đại diện (Tùy chọn)</label>

                {/* Manual Link Input */}
                <div className="mb-3">
                    <input
                        type="url"
                        value={manualCoverLink}
                        onChange={(e) => setManualCoverLink(e.target.value)}
                        placeholder="Dán Link Google Drive (Bất kỳ ai có đường dẫn)..."
                        className="block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-black bg-white"
                    />
                </div>

                <div className="text-xs text-yellow-600 font-bold mb-2 uppercase text-center">- HOẶC TẢI LÊN -</div>

                <input
                    type="file"
                    accept="image/*, .heic"
                    onChange={(e) => {
                        setImageFile(e.target.files?.[0] || null);
                        if (e.target.files?.[0]) setManualCoverLink(""); // Clear manual link if file selected
                    }}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {(initialData?.imageUrl || manualCoverLink) && !imageFile && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                        {manualCoverLink ? "Đang dùng link Drive" : "Đang có ảnh"}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Hỗ trợ JPG, PNG, WEBP và cả HEIC (iPhone)</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-yellow-800 mb-1">Liên kết đính kèm (Video/Website)</label>
                <input
                    type="url"
                    value={embeddedLink}
                    onChange={(e) => setEmbeddedLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... hoặc link website bất kỳ"
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-black font-bold bg-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Dán link YouTube, Vimeo để hiển thị video, hoặc link website để hiển thị thẻ liên kết.
                </p>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <label className="block text-sm font-bold text-yellow-800">Nội dung chi tiết</label>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = content;
                                const before = text.substring(0, start);
                                const selected = text.substring(start, end);
                                const after = text.substring(end, text.length);
                                const newContent = before + `<b>${selected}</b>` + after;
                                setContent(newContent);
                            }}
                            className="p-1 px-2 border rounded hover:bg-yellow-100 text-sm font-bold text-yellow-900 border-yellow-300"
                            title="In đậm"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = content;
                                const before = text.substring(0, start);
                                const selected = text.substring(start, end);
                                const after = text.substring(end, text.length);
                                const newContent = before + `<i>${selected}</i>` + after;
                                setContent(newContent);
                            }}
                            className="p-1 px-2 border rounded hover:bg-yellow-100 text-sm italic text-yellow-900 border-yellow-300"
                            title="In nghiêng"
                        >
                            I
                        </button>
                        <button
                            type="button"
                            onClick={() => document.getElementById('bulletin-content-image-upload')?.click()}
                            className="text-sm text-yellow-700 hover:text-yellow-900 flex items-center gap-1 ml-2 font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Chèn ảnh
                        </button>
                    </div>

                    <input
                        id="bulletin-content-image-upload"
                        type="file"
                        accept="image/*, .heic"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleContentImageUpload(file);
                            e.target.value = ''; // Reset input
                        }}
                    />
                </div>
                <textarea
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 h-64 md:h-[200px] text-base leading-relaxed text-black bg-white"
                    placeholder="Nhập nội dung thông báo ngắn gọn..."
                />
                <p className="mt-2 text-xs text-gray-500">
                    * Bảng tin dành cho các thông báo nhanh. Bạn có thể chèn ảnh minh họa nếu cần thiết.
                </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-yellow-200">
                <div>
                    {initialData?.id && onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Xóa Thông Báo
                        </button>
                    )}
                </div>
                <div className="flex">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none disabled:opacity-50"
                    >
                        {loading ? "Đang đăng..." : "Đăng Thông Báo"}
                    </button>
                </div>
            </div>
        </form>
    );
}
