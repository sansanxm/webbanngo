"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        subject: "Góp ý chung",
        message: "",
    });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.message) return;

        setSending(true);
        try {
            await addDoc(collection(db, "feedbacks"), {
                ...formData,
                createdAt: new Date().toISOString(),
                status: "new",
            });
            setSuccess(true);
            setFormData({ name: "", phone: "", email: "", subject: "Góp ý chung", message: "" });
            setTimeout(() => {
                setSuccess(false);
                setIsOpen(false);
            }, 2500);
        } catch (err) {
            console.error("Error sending feedback:", err);
            alert("Có lỗi xảy ra khi gửi thư góp ý. Vui lòng thử lại!");
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-[204px] right-6 z-40 bg-red-800 hover:bg-red-900 text-white p-3 md:px-4 md:py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs md:text-sm border-2 border-yellow-400 group transition-all duration-300 hover:scale-105"
                title="Gửi thư góp ý tới BGH Trường"
            >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline pr-0.5">Hộp Thư Góp Ý</span>
            </button>

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
                                ✉️
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gửi Thư Góp Ý / Liên Hệ BGH</h3>
                                <p className="text-xs text-gray-500">Ý kiến của phụ huynh & học sinh giúp nhà trường hoàn thiện hơn</p>
                            </div>
                        </div>

                        {success ? (
                            <div className="p-6 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-2xl text-center font-medium my-4">
                                🎉 Cảm ơn bạn! Thư góp ý đã được gửi trực tiếp tới Ban Giám hiệu thành công.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Họ và tên *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ví dụ: Nguyễn Văn A (Phụ huynh em Nguyễn Văn B)"
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0912..."
                                            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Chủ đề</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                                        >
                                            <option value="Góp ý chung">Góp ý chung</option>
                                            <option value="Công tác Bán trú">Công tác Bán trú</option>
                                            <option value="Chuyên môn / Học tập">Chuyên môn / Học tập</option>
                                            <option value="Cơ sở vật chất">Cơ sở vật chất</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nội dung góp ý *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Nhập chi tiết nội dung ý kiến, thắc mắc hoặc phản ánh..."
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="px-6 py-2 text-sm bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
                                    >
                                        {sending ? "Đang gửi..." : "Gửi Thư Góp Ý"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
