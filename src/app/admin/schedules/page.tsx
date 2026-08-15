"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ScheduleDay {
    dayName: string;
    dateStr: string;
    workSchedule: string;
    dutySchedule: string;
    examSchedule: string;
}

const DEFAULT_SCHEDULE: ScheduleDay[] = [
    { dayName: "Thứ Hai", dateStr: "Đầu tuần", workSchedule: "7h30: Chào cờ toàn trường; 8h30: Giao ban BGH", dutySchedule: "Trực tuần: Thầy Nam & Cô Huệ", examSchedule: "Học bình thường theo TKB" },
    { dayName: "Thứ Ba", dateStr: "", workSchedule: "14h00: Sinh hoạt chuyên môn các tổ", dutySchedule: "Trực bán trú: Cô Mai", examSchedule: "Kiểm tra 1 tiết Toán 9" },
    { dayName: "Thứ Tư", dateStr: "", workSchedule: "8h00: Tập huấn chuyển đổi số GV", dutySchedule: "Trực bán trú: Thầy Hùng", examSchedule: "Học bình thường" },
    { dayName: "Thứ Năm", dateStr: "", workSchedule: "14h30: Kiểm tra công tác bán trú", dutySchedule: "Trực bán trú: Cô Lan", examSchedule: "Kiểm tra Văn Khối 8" },
    { dayName: "Thứ Sáu", dateStr: "", workSchedule: "15h30: Sinh hoạt Chi bộ & Tổng kết tuần", dutySchedule: "Trực tuần: Cô Linh", examSchedule: "Học bình thường" },
    { dayName: "Thứ Bảy", dateStr: "", workSchedule: "Hoạt động trải nghiệm & Ngoại khóa Đội", dutySchedule: "Trực cuối tuần: Thầy Tuấn", examSchedule: "Nghỉ học chính khóa" },
    { dayName: "Chủ Nhật", dateStr: "Cuối tuần", workSchedule: "Vệ sinh khuôn viên & Chuẩn bị tuần mới", dutySchedule: "Bảo vệ trực 24/24", examSchedule: "Nghỉ" },
];

export default function AdminSchedulesPage() {
    const [days, setDays] = useState<ScheduleDay[]>(DEFAULT_SCHEDULE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const docRef = doc(db, "weekly_schedules", "current");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().days) {
                    setDays(docSnap.data().days);
                }
            } catch (err) {
                console.error("Error loading schedule:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSchedule();
    }, []);

    const handleChange = (index: number, field: keyof ScheduleDay, value: string) => {
        const updated = [...days];
        updated[index] = { ...updated[index], [field]: value };
        setDays(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await setDoc(doc(db, "weekly_schedules", "current"), {
                days,
                updatedAt: new Date().toISOString(),
            });
            setMessage("✅ Đã lưu lịch làm việc tuần thành công!");
        } catch (err) {
            console.error("Error saving schedule:", err);
            setMessage("❌ Có lỗi xảy ra khi lưu lịch!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Đang tải dữ liệu lịch công tác...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📅 Quản Lý Lịch Công Tác Tuần</h1>
                    <p className="text-sm text-gray-500">Cập nhật lịch làm việc BGH, lịch trực tuần và lịch thi hiển thị ở trang chủ</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-red-800 hover:bg-red-900 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                >
                    {saving ? "Đang lưu..." : "💾 Lưu Thay Đổi"}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message}
                </div>
            )}

            <div className="space-y-6">
                {days.map((day, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-red-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                {day.dayName}
                            </span>
                            <input
                                type="text"
                                value={day.dateStr || ""}
                                onChange={(e) => handleChange(idx, "dateStr", e.target.value)}
                                placeholder="Ghi chú (Ví dụ: Ngày 15/10)"
                                className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-gray-700 dark:text-gray-300 w-48"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">📋 Lịch công tác</label>
                                <textarea
                                    rows={2}
                                    value={day.workSchedule}
                                    onChange={(e) => handleChange(idx, "workSchedule", e.target.value)}
                                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">🛡️ Lịch trực tuần</label>
                                <textarea
                                    rows={2}
                                    value={day.dutySchedule}
                                    onChange={(e) => handleChange(idx, "dutySchedule", e.target.value)}
                                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">📝 Lịch thi / kiểm tra</label>
                                <textarea
                                    rows={2}
                                    value={day.examSchedule}
                                    onChange={(e) => handleChange(idx, "examSchedule", e.target.value)}
                                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
