"use client";
import { useSettings } from "@/context/SettingsContext";
import PageHeader from "@/components/PageHeader";

export default function AboutPage() {
    const { settings } = useSettings();
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Header Banner */}
            <PageHeader
                title="Về"
                highlight="Chúng Tôi"
                description="Trường PTDTBT TH&THCS Bản Ngò"
            />

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
                <div className="prose prose-lg max-w-none text-gray-700">
                    <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center border-b pb-4">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </span>
                        Thông Tin Chung
                    </h2>
                    <p className="mb-6 leading-relaxed">
                        Chào mừng quý phụ huynh và các em học sinh đến với website chính thức của <strong>Trường PTDTBT TH&THCS Bản Ngò</strong>.
                        Tọa lạc tại vùng cao Tuyên Quang, chúng tôi tự hào là ngôi nhà thứ hai của các em học sinh dân tộc, nơi không chỉ dạy chữ mà còn nuôi dưỡng tâm hồn và nghị lực.
                    </p>
                    <p className="mb-10 leading-relaxed bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 italic text-blue-900">
                        "Giáo dục là vũ khí mạnh nhất mà người ta có thể sử dụng để thay đổi cả thế giới."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        {/* Vision Block */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl shadow-[0_10px_30px_-10px_rgba(251,191,36,0.5)] p-8 border border-yellow-200 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(251,191,36,0.6)] transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                            <h3 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center relative z-10">
                                <span className="bg-white p-2 rounded-full shadow-md mr-3 text-3xl">★</span> Tầm Nhìn
                            </h3>
                            <p className="text-yellow-900 leading-relaxed relative z-10 font-medium">
                                Trở thành trường chuẩn quốc gia mức độ 2, là điểm sáng về giáo dục vùng cao, nơi học sinh phát triển toàn diện về Đức - Trí - Thể - Mỹ.
                            </p>
                        </div>

                        {/* Mission Block */}
                        <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-[0_10px_30px_-10px_rgba(244,63,94,0.4)] p-8 border border-red-200 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(244,63,94,0.5)] transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-300/20 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                            <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center relative z-10">
                                <span className="bg-white p-2 rounded-full shadow-md mr-3 text-3xl">♥</span> Sứ Mệnh
                            </h3>
                            <p className="text-red-900 leading-relaxed relative z-10 font-medium">
                                Tạo dựng môi trường học tập an toàn, thân thiện, bình đẳng. Giúp học sinh tự tin, sáng tạo và biết yêu thương.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center border-b pb-4">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                        Lịch Sử Hình Thành & Phát Triển
                    </h2>
                    <div className="mb-12 space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            Nhà trường được thành lập năm <strong>1941</strong>, trải qua nhiều khó khăn gian khổ, các thế hệ nhà giáo của nhà trường đã dày công vun đắp cho sự nghiệp "trồng người" nơi vùng cao biên giới.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Năm 2016:</strong> Nhà trường vinh dự được công nhận là trường Tiểu học đạt <strong>Chuẩn Quốc gia Mức độ I</strong>. Đây là dấu mốc quan trọng khẳng định chất lượng giáo dục của nhà trường.
                            </li>
                            <li>
                                <strong>Năm 2017:</strong> Nhà trường chính thức được đổi tên thành <strong>Trường PTDTBT Tiểu học Bản Ngò</strong>, đánh dấu bước phát triển mới trong mô hình trường bán trú. Đến năm 2026, nhà trường chính thức sáp nhập với trường THCS Bản Ngò để thành lập <strong>Trường PTDTBT TH&THCS Bản Ngò</strong>.
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center border-b pb-4">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </span>
                        Đội Ngũ Nhà Giáo
                    </h2>
                    <div className="mb-12">
                        <p className="mb-6">
                            Năm học <strong>2025 - 2026</strong>, nhà trường có tổng số Cán bộ quản lý, Giáo viên, Nhân viên là <strong>34</strong> đồng chí. Đội ngũ giáo viên tâm huyết, giàu kinh nghiệm, luôn hết lòng vì học sinh thân yêu.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Principal Block */}
                            <div className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.4)] hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 group">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 mr-5 shadow-inner group-hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mb-1">Hiệu Trưởng</p>
                                    <h4 className="text-xl md:text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors uppercase">
                                        {settings.principalName || "Ông Nguyễn Thanh Long"}
                                    </h4>
                                </div>
                            </div>

                            {/* Vice Principal Block */}
                            <div className="flex items-center p-6 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl border border-indigo-200 shadow-[0_8px_20px_-8px_rgba(99,102,241,0.4)] hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 group">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 mr-5 shadow-inner group-hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-500 uppercase tracking-widest font-bold mb-1">Phó Hiệu Trưởng</p>
                                    <h4 className="text-xl md:text-2xl font-bold text-blue-900 group-hover:text-indigo-700 transition-colors uppercase">
                                        {settings.vicePrincipalName || "Bà Nông Thị Lượng và Bà Hoàng Thị Ngân"}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center border-b pb-4">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </span>
                        Liên Hệ Công Tác
                    </h2>
                    <ul className="space-y-4 text-gray-700 bg-gray-50 rounded-xl p-8">
                        <li className="flex items-start">
                            <strong className="min-w-[100px] text-gray-900">Địa chỉ:</strong>
                            <span>{settings.address || "Thôn Bản Ngò, xã Pà Vầy Sủ, huyện Xín Mần, tỉnh Tuyên Quang"}</span>
                        </li>
                        <li className="flex items-start">
                            <strong className="min-w-[100px] text-gray-900">Email:</strong>
                            <a href={`mailto:${settings.email || "c1bngo.xinman@hagiang.edu.vn"}`} className="text-blue-600 hover:underline">{settings.email || "c1bngo.xinman@hagiang.edu.vn"}</a>
                        </li>
                        <li className="flex items-start">
                            <strong className="min-w-[100px] text-gray-900">Điện thoại:</strong>
                            <span>{settings.phone || "097.1986.343"}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div >
    );
}
