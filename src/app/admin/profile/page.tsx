"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import Image from "next/image";

export default function ProfilePage() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPhotoURL(user.photoURL || "");
        }
    }, [user]);

    // Helper to resize/compress image - REUSED from PostForm
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
                    const MAX_WIDTH = 500; // Profile pics don't need to be huge

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
                    }, 'image/jpeg', 0.8);
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
                    quality: 0.8
                });
                processingFile = Array.isArray(blobOrBlobs) ? blobOrBlobs[0] : blobOrBlobs;
            } catch (e) {
                console.error("HEIC conversion failed", e);
                alert("Lỗi chuyển đổi ảnh HEIC");
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

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            if (!user) throw new Error("Chưa đăng nhập");

            let newPhotoURL = photoURL;

            if (imageFile) {
                const processedFile = await processImage(imageFile);
                const storageRef = ref(storage, `users/${user.uid}/avatar-${Date.now()}.jpg`);
                const snapshot = await uploadBytes(storageRef, processedFile);
                newPhotoURL = await getDownloadURL(snapshot.ref);
            }

            await updateProfile(user, {
                displayName: displayName,
                photoURL: newPhotoURL
            });

            // Force reload to update context? Or Context updates automatically?
            // Firebase Auth listener should pick it up, but sometimes takes a moment.
            // We can manually update local state or just show success.

            setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
            setPhotoURL(newPhotoURL);
        } catch (error: any) {
            console.error("Profile update error:", error);
            setMessage({ type: "error", text: "Lỗi: " + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Hồ sơ cá nhân</h1>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
                {message.text && (
                    <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4 group">
                            {photoURL || imageFile ? (
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : photoURL}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow transition-transform hover:scale-110">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-8.9l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input
                                    type="file"
                                    accept="image/*, .heic"
                                    className="hidden"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500">Nhấn vào icon máy ảnh để thay đổi</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                            placeholder="Nhập tên hiển thị của bạn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
