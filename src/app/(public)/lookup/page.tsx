"use client";

import { useState } from "react";

export default function SearchPage() {
    const [loading, setLoading] = useState(true);
    // URL from user
    const googleScriptUrl = "https://script.google.com/macros/s/AKfycbyF88vLI8m9WvbIxhf_Wtz8aCpTi3IzUr8Y1neoCO6sPAG8NGXL1BVlv9bw2oL7QH6wuA/exec";

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 uppercase">
                    Tra Cứu Kết Quả Học Tập
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Hệ thống tra cứu điểm trực tuyến. Nhập thông tin học sinh vào khung bên dưới để xem kết quả.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative min-h-[600px]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Đang tải hệ thống tra cứu...</p>
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

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>* Dữ liệu được cập nhật trực tiếp từ hệ thống quản lý của nhà trường.</p>
                <p>Nếu gặp sự cố, vui lòng liên hệ giáo viên chủ nhiệm.</p>
            </div>
        </div>
    );
}
