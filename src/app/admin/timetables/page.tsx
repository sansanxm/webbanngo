"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TimetableRow {
    day: string;
    morning: string;
    afternoon: string;
}

const CLASS_LIST = [
    "Lớp 1A1", "Lớp 1A2", "Lớp 1A3", "Lớp 1A4",
    "Lớp 2A1", "Lớp 2A2", "Lớp 2A3",
    "Lớp 3A1", "Lớp 3A2",
    "Lớp 4A1", "Lớp 4A2",
    "Lớp 5A1", "Lớp 5A2",
    "Lớp 6A", "Lớp 7A", "Lớp 8A", "Lớp 9A", "Lớp 9B"
];

const DEFAULT_PRIMARY = [
    { day: "Thứ 2", morning: "Chào cờ, Tiếng Việt, Tiếng Việt, Toán, Đạo đức", afternoon: "Hoạt động trải nghiệm, Tự học" },
    { day: "Thứ 3", morning: "Toán, Tiếng Việt, Tiếng Việt, Tự nhiên & Xã hội, Âm nhạc", afternoon: "Mỹ thuật, Thể dục" },
    { day: "Thứ 4", morning: "Tiếng Việt, Tiếng Việt, Toán, Tiếng Anh, Giáo dục thể chất", afternoon: "Ôn tập Tiếng Việt" },
    { day: "Thứ 5", morning: "Toán, Tiếng Việt, Tiếng Việt, Tự nhiên & Xã hội, Thủ công", afternoon: "Ôn tập Toán" },
    { day: "Thứ 6", morning: "Tiếng Việt, Toán, Tiếng Anh, Tin học & Công nghệ, SHL", afternoon: "Sinh hoạt Sao / Đội" },
];

const DEFAULT_SECONDARY = [
    { day: "Thứ 2", morning: "Chào cờ, Toán, Ngữ văn, Tiếng Anh, Khoa học tự nhiên", afternoon: "Thể dục, Sinh học" },
    { day: "Thứ 3", morning: "Toán, Hóa học, Ngữ văn, Lịch sử & Địa lý, GDCD", afternoon: "Tin học, Công nghệ" },
    { day: "Thứ 4", morning: "Tiếng Anh, Toán, Ngữ văn, GDCD, Khoa học tự nhiên", afternoon: "Phụ đạo Toán" },
    { day: "Thứ 5", morning: "Vật lý, Hóa học, Toán, Ngữ văn, Tiếng Anh", afternoon: "Phụ đạo Ngữ văn" },
    { day: "Thứ 6", morning: "Lịch sử & Địa lý, GDCD, Âm nhạc, Mỹ thuật, SHL", afternoon: "Sinh hoạt Đội" },
];

export default function AdminTimetablesPage() {
    const [selectedClass, setSelectedClass] = useState("Lớp 1A1");
    const [rows, setRows] = useState<TimetableRow[]>(DEFAULT_PRIMARY);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Load timetable when selected class changes
    useEffect(() => {
        const loadTimetable = async () => {
            setLoading(true);
            setMessage("");
            const isSecondary = ["Lớp 6A", "Lớp 7A", "Lớp 8A", "Lớp 9A", "Lớp 9B"].includes(selectedClass);
            const defaultTemplate = isSecondary ? DEFAULT_SECONDARY : DEFAULT_PRIMARY;

            try {
                const docRef = doc(db, "timetables", selectedClass);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().rows) {
                    setRows(docSnap.data().rows);
                } else {
                    setRows(defaultTemplate);
                }
            } catch (err) {
                console.error("Error loading timetable:", err);
                setRows(defaultTemplate);
            } finally {
                setLoading(false);
            }
        };

        loadTimetable();
    }, [selectedClass]);

    const handleRowChange = (index: number, field: "morning" | "afternoon", value: string) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: value };
        setRows(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await setDoc(doc(db, "timetables", selectedClass), {
                className: selectedClass,
                rows: rows,
                updatedAt: new Date().toISOString(),
            });
            setMessage(`✅ Đã lưu thời khóa biểu cho ${selectedClass} thành công!`);
        } catch (err) {
            console.error("Error saving timetable:", err);
            setMessage("❌ Có lỗi xảy ra khi lưu thời khóa biểu!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📚 Quản Lý Thời Khóa Biểu</h1>
                    <p className="text-sm text-gray-500">Cập nhật danh sách môn học cho 18 lớp từ Khối 1 đến Khối 9</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-red-800 hover:bg-red-900 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                >
                    {saving ? "Đang lưu..." : "💾 Lưu Thời Khóa Biểu"}
                </button>
            </div>

            {/* Class Selector Dropdown */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6 flex flex-col sm:flex-row items-center gap-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Chọn lớp cần nhập:</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-base font-bold flex-1 max-w-xs"
                >
                    {CLASS_LIST.map((cls) => (
                        <option key={cls} value={cls}>
                            {cls}
                        </option>
                    ))}
                </select>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message}
                </div>
            )}

            {/* Editable Timetable List */}
            {loading ? (
                <div className="p-8 text-center text-gray-500">Đang tải thời khóa biểu {selectedClass}...</div>
            ) : (
                <div className="space-y-4">
                    {rows.map((row, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="font-bold text-red-700 dark:text-red-400 text-sm mb-3">
                                📌 {row.day}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                                        ☀️ Buổi sáng (7h30 - 11h15)
                                    </label>
                                    <input
                                        type="text"
                                        value={row.morning}
                                        onChange={(e) => handleRowChange(idx, "morning", e.target.value)}
                                        placeholder="Ví dụ: Chào cờ, Toán, Tiếng Việt..."
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                                        ⛅ Buổi chiều (14h00 - 16h30)
                                    </label>
                                    <input
                                        type="text"
                                        value={row.afternoon}
                                        onChange={(e) => handleRowChange(idx, "afternoon", e.target.value)}
                                        placeholder="Ví dụ: Thể dục, Tự học..."
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
