"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";

interface SystemSettings {
    bannerUrl?: string;
    bannerImages?: string[];
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
    zaloQrUrl?: string; // Added Zalo QR
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    // const [bannerFile, setBannerFile] = useState<File | null>(null); // Removed single banner file
    // const [bannerPreview, setBannerPreview] = useState(""); // Removed preview

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as SystemSettings);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    // Helper to resize/compress image 
    const resizeAndCompressImage = (file: File | Blob): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1920; // Banner needs high res

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Compression failed"));
                    }, 'image/jpeg', 0.85); // High quality for banner
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const processImage = async (file: File): Promise<File> => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const isHeic = ext === 'heic' || ext === 'heif' || file.type.includes('heic') || file.type.includes('heif');

        let processingFile: File | Blob = file;

        if (isHeic) {
            try {
                const heic2any = (await import("heic2any")).default;
                const blobOrBlobs = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.9
                });
                processingFile = Array.isArray(blobOrBlobs) ? blobOrBlobs[0] : blobOrBlobs;
            } catch (e) {
                console.error("HEIC conversion failed", e);
                throw new Error("Không thể chuyển đổi ảnh HEIC");
            }
        }

        try {
            const compressedBlob = await resizeAndCompressImage(processingFile);
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            return new File([compressedBlob], newName, { type: "image/jpeg" });
        } catch (error) {
            console.error("Compression failed", error);
            throw new Error("Lỗi tối ưu hóa ảnh");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            // Use list of images
            // If user added new images via upload input, they are already in settings.bannerImages via its onChange
            // So we just save the settings object.

            // Note: We are not handling single bannerFile anymore here because we handle it in the "Upload" input onChange directly for multiple files.

            const updatedSettings = { ...settings }; // settings already contains updated bannerImages from state
            await setDoc(doc(db, "settings", "general"), updatedSettings, { merge: true });

            setSettings(updatedSettings);
            setMessage({ type: "success", text: "Lưu cấu hình thành công!" });
        } catch (error: any) {
            console.error("Save settings error:", error);
            setMessage({ type: "error", text: "Lỗi: " + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Đang tải...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Cấu hình hệ thống</h1>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
                {message.text && (
                    <div className={`mb-6 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Banner Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Ảnh Bìa / Slideshow Trang Chủ</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Danh sách ảnh đang hiển thị</label>

                            {settings.bannerImages && settings.bannerImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {settings.bannerImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-video group rounded-lg overflow-hidden shadow-sm border">
                                            <img src={img.includes("drive.google.com") ? img : img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = settings.bannerImages?.filter((_, i) => i !== idx);
                                                    setSettings({ ...settings, bannerImages: newImages });
                                                }}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Xóa ảnh này"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                                                #{idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 italic mb-4 bg-gray-50 p-4 rounded text-center">Chưa có ảnh nào. Hãy thêm ảnh bên dưới.</div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div>
                                <label className="block text-sm font-bold text-blue-800 mb-2">Thêm ảnh từ Google Drive</label>
                                <textarea
                                    rows={4}
                                    placeholder="Dán link ảnh Google Drive vào đây (mỗi dòng 1 link)..."
                                    className="block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                                    onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        if (val) {
                                            const lines = val.split('\n').map(l => l.trim()).filter(l => l);
                                            const newImages = [...(settings.bannerImages || [])];

                                            // Helper to convert Drive link
                                            const getDriveDirectLink = (url: string) => {
                                                const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
                                                if (match && url.includes("drive.google.com")) {
                                                    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
                                                }
                                                return url;
                                            };

                                            let addedLink = false;
                                            lines.forEach(line => {
                                                if (line) {
                                                    newImages.push(getDriveDirectLink(line));
                                                    addedLink = true;
                                                }
                                            });

                                            if (addedLink) {
                                                setSettings({ ...settings, bannerImages: newImages });
                                                e.target.value = ""; // Clear input
                                            }
                                        }
                                    }}
                                />
                                <p className="mt-2 text-xs text-blue-600">
                                    * Mẹo: Dán link rồi click ra ngoài để thêm. Link Drive phải ở chế độ "Bất kỳ ai có đường dẫn".
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-blue-800 mb-2">Hoặc Tải ảnh lên</label>
                                <input
                                    type="file"
                                    accept="image/*, .heic"
                                    multiple
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const files = Array.from(e.target.files);
                                            setMessage({ type: "info", text: "Đang xử lý ảnh..." });
                                            setSaving(true);

                                            const newUrls: string[] = [];

                                            try {
                                                for (const file of files) {
                                                    const processedFile = await processImage(file);
                                                    const storageRef = ref(storage, `settings/banner-${Date.now()}-${file.name}`);
                                                    const snapshot = await uploadBytes(storageRef, processedFile);
                                                    const url = await getDownloadURL(snapshot.ref);
                                                    newUrls.push(url);
                                                }

                                                setSettings(prev => ({
                                                    ...prev,
                                                    bannerImages: [...(prev.bannerImages || []), ...newUrls]
                                                }));

                                                setMessage({ type: "success", text: "Đã thêm ảnh vào danh sách (Nhớ ấn Lưu Cấu Hình)" });
                                            } catch (err: any) {
                                                console.error(err);
                                                setMessage({ type: "error", text: "Lỗi tải ảnh: " + err.message });
                                            } finally {
                                                setSaving(false);
                                                e.target.value = ""; // Reset input
                                            }
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                />
                                <p className="mt-2 text-xs text-blue-600">Hỗ trợ chọn nhiều ảnh cùng lúc.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Thông Tin Liên Hệ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên Trường</label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    value={settings.schoolName || ""}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ và tên Hiệu trưởng</label>
                                <input
                                    type="text"
                                    name="principalName"
                                    value={settings.principalName || ""}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Thầy Nguyễn Văn A"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ và tên Phó Hiệu trưởng</label>
                                <input
                                    type="text"
                                    name="vicePrincipalName"
                                    value={settings.vicePrincipalName || ""}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Cô Phạm Thị Ngân Thuỷ"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={settings.email || ""}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={settings.phone || ""}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Địa Chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={settings.address || ""}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Link Bản Đồ (Google Maps Embed URL)</label>
                                <input
                                    type="text"
                                    name="mapUrl"
                                    value={settings.mapUrl || ""}
                                    onChange={handleChange}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Hướng dẫn: Vào Google Maps {'>'} Chia sẻ {'>'} Nhúng bản đồ {'>'} Copy nội dung trong thẻ src="..."
                                </p>
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mã QR Zalo (Hiển thị khi bấm nút Zalo)</label>
                                <div className="flex items-start gap-6">
                                    {settings.zaloQrUrl ? (
                                        <div className="relative w-32 h-32 border-2 border-blue-100 shadow-md group bg-white">
                                            <img src={settings.zaloQrUrl} alt="Zalo QR" className="w-full h-full object-contain p-1" />
                                            <button
                                                type="button"
                                                onClick={() => setSettings({ ...settings, zaloQrUrl: "" })}
                                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity font-bold text-sm"
                                            >
                                                Xóa QR
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-50 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                                            <span className="text-xs text-center px-2">Chưa có QR</span>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    setMessage({ type: "info", text: "Đang xử lý ảnh QR..." });
                                                    setSaving(true);
                                                    try {
                                                        const processedFile = await processImage(file);
                                                        const storageRef = ref(storage, `settings/zalo-qr-${Date.now()}-${file.name}`);
                                                        const snapshot = await uploadBytes(storageRef, processedFile);
                                                        const url = await getDownloadURL(snapshot.ref);

                                                        setSettings(prev => ({ ...prev, zaloQrUrl: url }));
                                                        setMessage({ type: "success", text: "Đã tải QR Zalo lên success" });
                                                    } catch (err: any) {
                                                        console.error(err);
                                                        setMessage({ type: "error", text: "Lỗi tải ảnh: " + err.message });
                                                    } finally {
                                                        setSaving(false);
                                                        e.target.value = ""; // Reset
                                                    }
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">Tải lên ảnh mã QR Zalo cá nhân hoặc nhóm Zalo của trường.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Principal Info Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Thông điệp & Hình ảnh Hiệu trưởng</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lời ngỏ / Thông điệp chào mừng</label>
                                <textarea
                                    rows={4}
                                    name="principalMessage"
                                    value={settings.principalMessage || ""}
                                    onChange={(e) => setSettings({ ...settings, principalMessage: e.target.value })}
                                    placeholder="Nhập lời chào mừng của Hiệu trưởng..."
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh Chân Dung Hiệu Trưởng</label>
                                <div className="flex items-start gap-6">
                                    {settings.principalImageUrl ? (
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-blue-100 shadow-md group">
                                            <img src={settings.principalImageUrl} alt="Principal" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setSettings({ ...settings, principalImageUrl: "" })}
                                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity font-bold text-sm"
                                            >
                                                Xóa ảnh
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                            <span className="text-xs text-center px-2">Chưa có ảnh</span>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    setMessage({ type: "info", text: "Đang xử lý ảnh..." });
                                                    setSaving(true);
                                                    try {
                                                        const processedFile = await processImage(file);
                                                        const storageRef = ref(storage, `settings/principal-${Date.now()}-${file.name}`);
                                                        const snapshot = await uploadBytes(storageRef, processedFile);
                                                        const url = await getDownloadURL(snapshot.ref);

                                                        setSettings(prev => ({ ...prev, principalImageUrl: url }));
                                                        setMessage({ type: "success", text: "Đã tải ảnh lên (Nhớ ấn Lưu Cấu Hình)" });
                                                    } catch (err: any) {
                                                        console.error(err);
                                                        setMessage({ type: "error", text: "Lỗi tải ảnh: " + err.message });
                                                    } finally {
                                                        setSaving(false);
                                                        e.target.value = ""; // Reset
                                                    }
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">Khuyến nghị: Ảnh vuông hoặc chân dung, dung lượng dưới 5MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Configuration Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Cấu hình Trợ lý AI (Gemini)</h2>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
                            <p className="text-sm text-yellow-800 font-medium">
                                💡 Nhập mã API từ Google AI Studio để kích hoạt trợ lý AI trên trang chủ.
                                Bạn có thể thay đổi mã này bất cứ lúc nào nếu mã cũ hết lượt dùng.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Google Gemini API Key</label>
                                <input
                                    type="password"
                                    name="geminiApiKey"
                                    value={settings.geminiApiKey || ""}
                                    onChange={handleChange}
                                    placeholder="Nhập mã API của bạn..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Lưu ý: Mã này sẽ được sử dụng trực tiếp trên trình duyệt của người dùng.
                                    Lấy mã tại: <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full md:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {saving ? "Đang lưu..." : "Lưu Cấu Hình Mới"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
