"use client";

import { useState } from "react";

export default function SearchPage() {
    const [activeTab, setActiveTab] = useState<"grades" | "timetable" | "exams">("grades");
    const [loading, setLoading] = useState(true);
    const [selectedGrade, setSelectedGrade] = useState("Lớp 9A");

    // URL from user
    const googleScriptUrl = "https://script.google.com/macros/s/AKfycbyF88vLI8m9WvbIxhf_Wtz8aCpTi3IzUr8Y1neoCO6sPAG8NGXL1BVlv9bw2oL7QH6wuA/exec";

    const TIMETABLES: Record<string, { day: string; morning: string; afternoon: string }[]> = {
        "Lớp 9A": [
            { day: "Thứ 2", morning: "Chào cờ, Toán, Ngữ Văn, Tiếng Anh, Lý", afternoon: "Thể dục, Sinh học" },
            { day: "Thứ 3", morning: "Toán, Hóa học, Ngữ Văn, Lịch sử, Địa lý", afternoon: "Tin học, Công nghệ" },
            { day: "Thứ 4", morning: "Tiếng Anh, Toán, Ngữ Văn, GDCD, Sinh", afternoon: "Phụ đạo Toán" },
            { day: "Thứ 5", morning: "Vật lý, Hóa học, Toán, Ngữ Văn, Tiếng Anh", afternoon: "Phụ đạo Ngữ Văn" },
            { day: "Thứ 6", morning: "Lịch sử, Địa lý, GDCD, Âm nhạc, Mỹ thuật", afternoon: "Sinh hoạt Lớp" },
        ],
        "Lớp 8A": [
            { day: "Thứ 2", morning: "Chào cờ, Ngữ Văn, Toán, Tiếng Anh, Sinh", afternoon: "Thể dục" },
            { day: "Thứ 3", morning: "Toán, Vật lý, Ngữ Văn, Hóa học, Lịch sử", afternoon: "Tin học" },
            { day: "Thứ 4", morning: "Ngữ Văn, Toán, Tiếng Anh, Địa lý, GDCD", afternoon: "Học thêm Toán" },
            { day: "Thứ 5", morning: "Hóa học, Sinh học, Ngữ Văn, Toán, Công nghệ", afternoon: "Học thêm Văn" },
            { day: "Thứ 6", morning: "Tiếng Anh, Âm nhạc, Mỹ thuật, Thể dục, SHL", afternoon: "Hoạt động Đội" },
        ],
        "Lớp 7A": [
            { day: "Thứ 2", morning: "Chào cờ, Toán, Ngữ Văn, Tiếng Anh, Khoa học tự nhiên", afternoon: "Ngoại khóa" },
            { day: "Thứ 3", morning: "Ngữ Văn, Toán, Lịch sử & Địa lý, GDCD, Công nghệ", afternoon: "Tin học" },
            { day: "Thứ 4", morning: "Khoa học tự nhiên, Tiếng Anh, Toán, Ngữ Văn, Thể dục", afternoon: "Ôn tập" },
            { day: "Thứ 5", morning: "Toán, Ngữ Văn, Tiếng Anh, Âm nhạc, Mỹ thuật", afternoon: "Đọc sách thư viện" },
            { day: "Thứ 6", morning: "Lịch sử & Địa lý, Khoa học tự nhiên, GDCD, SHL", afternoon: "Sinh hoạt lớp" },
        ],
    };

    return (
        <div className="max-w-5xl mx-auto py-6 px-4">
            <div className="text-center mb-6">
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Cổng Thông Tin Học Sinh
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-3 uppercase">
                    Hệ Thống Tra Cứu Trực Tuyến
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm">
                    Tra cứu điểm số, thời khóa biểu học tập và lịch thi kiểm tra của học sinh Trường PTDTBT TH&THCS Bản Ngò.
                </p>
            </div>

            {/* Main Tabs Header */}
            <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full">
                    <button
                        onClick={() => setActiveTab("grades")}
                        className={`flex-1 py-2.5 px-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            activeTab === "grades"
                                ? "bg-red-800 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        📊 Tra Cứu Điểm Số
                    </button>
                    <button
                        onClick={() => setActiveTab("timetable")}
                        className={`flex-1 py-2.5 px-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            activeTab === "timetable"
                                ? "bg-red-800 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        📚 Thời Khóa Biểu
                    </button>
                    <button
                        onClick={() => setActiveTab("exams")}
                        className={`flex-1 py-2.5 px-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            activeTab === "exams"
                                ? "bg-red-800 text-white shadow-md"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        📝 Lịch Thi & Phòng Thi
                    </button>
                </div>
            </div>

            {/* TAB 1: Tra cứu điểm trực tuyến */}
            {activeTab === "grades" && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative min-h-[600px]">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500 font-medium text-sm">Đang tải hệ thống tra cứu điểm...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={googleScriptUrl}
                        className="w-full h-[800px] border-none"
                        onLoad={() => setLoading(false)}
                        title="Tra cứu kết quả học tập"
                    />
                </div>
            )}

            {/* TAB 2: Thời khóa biểu */}
            {activeTab === "timetable" && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">📅 Thời Khóa Biểu Học Tập</h3>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-500">Chọn Lớp:</label>
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-bold"
                            >
                                <option value="Lớp 9A">Lớp 9A</option>
                                <option value="Lớp 8A">Lớp 8A</option>
                                <option value="Lớp 7A">Lớp 7A</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-red-900 text-white text-xs uppercase tracking-wider">
                                    <th className="p-3.5 rounded-tl-xl">Ngày</th>
                                    <th className="p-3.5">Buổi Sáng (7h30 - 11h15)</th>
                                    <th className="p-3.5 rounded-tr-xl">Buổi Chiều (14h00 - 16h30)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {(TIMETABLES[selectedGrade] || TIMETABLES["Lớp 9A"]).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3.5 font-bold text-red-700 dark:text-red-400 w-24">{row.day}</td>
                                        <td className="p-3.5 text-gray-800 dark:text-gray-200">{row.morning}</td>
                                        <td className="p-3.5 text-gray-600 dark:text-gray-400">{row.afternoon}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: Lịch thi & Phòng thi */}
            {activeTab === "exams" && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📝 Lịch Thi & Sơ Đồ Phòng Thi Học Kỳ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Kế hoạch sắp tới</span>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mt-2 mb-1">Thi Khảo Sát Chất Lượng Học Kỳ I</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Thời gian: Từ ngày 20/12 đến ngày 25/12</p>
                            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                                <li>• <strong>Khối 6, 7, 8, 9:</strong> Thi tập trung tại các phòng thi số 01 - 08.</li>
                                <li>• <strong>Khối Tiểu học:</strong> Đánh giá theo thông tư tại lớp học.</li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                            <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Lưu ý học sinh</span>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mt-2 mb-1">Nội Quy Phòng Thi</h4>
                            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                                <li>1. Có mặt tại phòng thi trước giờ làm bài 15 phút.</li>
                                <li>2. Mang đầy đủ dụng cụ học tập (bút, thước, máy tính bỏ túi).</li>
                                <li>3. Tuyệt đối không mang tài liệu và thiết bị thu phát sóng vào phòng thi.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 text-center text-xs text-gray-500">
                <p>* Dữ liệu tra cứu được cập nhật trực tiếp từ hệ thống quản lý của Nhà trường.</p>
                <p className="mt-0.5">Nếu gặp sự cố hoặc cần hỗ trợ, vui lòng liên hệ Giáo viên chủ nhiệm hoặc gửi thư góp ý cho BGH.</p>
            </div>
        </div>
    );
}
