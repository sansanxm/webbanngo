"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FeedbackItem {
    id: string;
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    status: "new" | "read" | "processed";
}

export default function AdminFeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeedbackItem));
            setFeedbacks(list);
        } catch (err) {
            console.error("Error loading feedbacks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: "read" | "processed") => {
        try {
            await updateDoc(doc(db, "feedbacks", id), { status: newStatus });
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thư góp ý này?")) return;
        try {
            await deleteDoc(doc(db, "feedbacks", id));
            setFeedbacks(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error("Error deleting feedback:", err);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">✉️ Quản Lý Hộp Thư Góp Ý</h1>
                    <p className="text-sm text-gray-500">Xem và xử lý ý kiến đóng góp từ Phụ huynh & Học sinh gửi tới Ban Giám hiệu</p>
                </div>
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-4 py-2 rounded-full font-bold text-sm">
                    {feedbacks.filter(f => f.status === "new").length} thư mới
                </span>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Đang tải danh sách thư...</div>
            ) : feedbacks.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl text-center border text-gray-500">
                    Chưa có thư góp ý nào.
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map((item) => (
                        <div
                            key={item.id}
                            className={`p-5 rounded-2xl border transition-all ${
                                item.status === "new"
                                    ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-sm"
                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                            }`}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                                <div>
                                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase mr-2">
                                        {item.subject}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white text-base">{item.name}</span>
                                    {item.phone && <span className="text-xs text-gray-500 ml-2">📞 {item.phone}</span>}
                                    {item.email && <span className="text-xs text-gray-500 ml-2">✉️ {item.email}</span>}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                                </div>
                            </div>

                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl mb-3">
                                {item.message}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-xs">
                                <div>
                                    Thẻ trạng thái:{" "}
                                    <span className={`font-bold ${item.status === "new" ? "text-red-600" : item.status === "processed" ? "text-green-600" : "text-gray-500"}`}>
                                        {item.status === "new" ? "Chưa đọc" : item.status === "processed" ? "Đã xử lý" : "Đã đọc"}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {item.status === "new" && (
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, "read")}
                                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 rounded-lg"
                                        >
                                            Đã đọc
                                        </button>
                                    )}
                                    {item.status !== "processed" && (
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, "processed")}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                        >
                                            Đánh dấu Đã Xử Lý
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
