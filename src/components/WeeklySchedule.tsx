"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
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

export default function WeeklySchedule() {
    const [schedule, setSchedule] = useState<ScheduleDay[]>(DEFAULT_SCHEDULE);
    const [selectedTab, setSelectedTab] = useState<"work" | "duty" | "exam">("work");
    const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const docRef = doc(db, "weekly_schedules", "current");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().days) {
                    setSchedule(docSnap.data().days);
                }
            } catch (err) {
                console.error("Error fetching weekly schedule:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    return (
        <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800 my-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        Cập nhật hàng tuần
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        📅 Lịch Làm Việc & Học Tập Tuần
                    </h2>
                </div>

                {/* Schedule Type Selector */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSelectedTab("work")}
                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            selectedTab === "work"
                                ? "bg-red-800 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        📋 Lịch Công Tác
                    </button>
                    <button
                        onClick={() => setSelectedTab("duty")}
                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            selectedTab === "duty"
                                ? "bg-red-800 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        🛡️ Lịch Trực Tuần
                    </button>
                    <button
                        onClick={() => setSelectedTab("exam")}
                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            selectedTab === "exam"
                                ? "bg-red-800 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        📝 Lịch Thi / Kiểm Tra
                    </button>
                </div>
            </div>

            {/* Days Nav Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
                {schedule.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl text-center border transition-all ${
                            selectedDayIndex === idx
                                ? "bg-blue-900 text-white border-blue-900 shadow-lg scale-105 font-bold"
                                : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        <div className="text-xs uppercase tracking-wider opacity-80">{item.dayName}</div>
                        {item.dateStr && <div className="text-[10px] mt-0.5 opacity-75">{item.dateStr}</div>}
                    </button>
                ))}
            </div>

            {/* Content Display Card */}
            <div className="mt-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {schedule[selectedDayIndex]?.dayName}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        {selectedTab === "work" && "Nội dung công tác BGH & Tổ chuyên môn"}
                        {selectedTab === "duty" && "Phân công giáo viên & cán bộ trực tuần"}
                        {selectedTab === "exam" && "Kế hoạch thi, kiểm tra & đánh giá"}
                    </span>
                </div>

                <div className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed min-h-[60px] flex items-center">
                    {selectedTab === "work" && (schedule[selectedDayIndex]?.workSchedule || "Chưa có lịch")}
                    {selectedTab === "duty" && (schedule[selectedDayIndex]?.dutySchedule || "Chưa có lịch")}
                    {selectedTab === "exam" && (schedule[selectedDayIndex]?.examSchedule || "Chưa có lịch")}
                </div>
            </div>
        </section>
    );
}
