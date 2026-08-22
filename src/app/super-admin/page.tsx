"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SchoolItem {
    id: string;
    schoolName: string;
    subdomain: string;
    customDomain?: string;
    address?: string;
    phone?: string;
    email?: string;
    createdAt?: string;
}

export default function SuperAdminPage() {
    const [schools, setSchools] = useState<SchoolItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newSchool, setNewSchool] = useState({
        id: "",
        schoolName: "",
        subdomain: "",
        address: "",
        phone: "",
        email: "",
    });

    const fetchSchools = async () => {
        try {
            const snap = await getDocs(collection(db, "system_schools"));
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolItem));

            // Ensure main school is always in list
            const hasMain = list.some(s => s.id === "thcs-banngo");
            if (!hasMain) {
                list.unshift({
                    id: "thcs-banngo",
                    schoolName: "Trường PTDTBT TH&THCS Bản Ngò",
                    subdomain: "banngo",
                    address: "Thôn Bản Ngò, xã Pà Vầy Sủ, tỉnh Tuyên Quang",
                    phone: "097.1986.343",
                    email: "c1bngo.xinman@hagiang.edu.vn",
                });
            }

            setSchools(list);
        } catch (err) {
            console.error("Error fetching schools:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchool.id || !newSchool.schoolName) {
            alert("Vui lòng nhập Mã trường và Tên trường!");
            return;
        }

        const schoolId = newSchool.id.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
        setSaving(true);

        try {
            // 1. Create school entry in system_schools
            await setDoc(doc(db, "system_schools", schoolId), {
                ...newSchool,
                id: schoolId,
                createdAt: new Date().toISOString(),
            });

            // 2. Initialize tenant settings in schools/{schoolId}/settings/general
            await setDoc(doc(db, "schools", schoolId, "settings", "general"), {
                schoolId: schoolId,
                schoolName: newSchool.schoolName,
                address: newSchool.address,
                phone: newSchool.phone,
                email: newSchool.email,
                principalMessage: `Chào mừng các em học sinh thân yêu đến với ${newSchool.schoolName}.`,
            });

            alert(`🎉 Đã tạo trường ${newSchool.schoolName} thành công!`);
            setShowCreateModal(false);
            setNewSchool({ id: "", schoolName: "", subdomain: "", address: "", phone: "", email: "" });
            fetchSchools();
        } catch (err) {
            console.error("Error creating school:", err);
            alert("Có lỗi xảy ra khi tạo trường mới!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            Hệ Thống Đa Trường Học (Multi-Tenant SaaS)
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                            👑 Super Admin Portal
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý toàn bộ danh sách trường học và phân quyền tên miền riêng trên hệ thống
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                    >
                        ➕ Thêm Trường Học Mới
                    </button>
                </div>

                {/* Schools Grid */}
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải danh sách các trường học...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schools.map((school) => (
                            <div
                                key={school.id}
                                className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                                            ID: {school.id}
                                        </span>
                                        {school.id === "thcs-banngo" && (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                TRƯỜNG GỐC
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                                        {school.schoolName}
                                    </h3>

                                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        {school.address && <p>📍 {school.address}</p>}
                                        {school.phone && <p>📞 {school.phone}</p>}
                                        {school.email && <p>✉️ {school.email}</p>}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                                    <a
                                        href={`/?school=${school.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 text-center py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors"
                                    >
                                        🌐 Xem Website
                                    </a>
                                    <a
                                        href={`/admin/dashboard`}
                                        className="flex-1 text-center py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                                    >
                                        ⚙️ Vào Admin
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create School Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-800 relative">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                        >
                            ✕
                        </button>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Thêm Trường Học Mới</h3>
                        <p className="text-xs text-gray-500 mb-6">Khởi tạo không gian website và dữ liệu độc lập cho trường mới</p>

                        <form onSubmit={handleCreateSchool} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Mã định danh trường (School ID) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newSchool.id}
                                    onChange={(e) => setNewSchool({ ...newSchool, id: e.target.value })}
                                    placeholder="Ví dụ: thcs-tantrao"
                                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Tên trường đầy đủ *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newSchool.schoolName}
                                    onChange={(e) => setNewSchool({ ...newSchool, schoolName: e.target.value })}
                                    placeholder="Ví dụ: Trường THCS Tân Trào"
                                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={newSchool.phone}
                                        onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                                        placeholder="0912..."
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email trường</label>
                                    <input
                                        type="email"
                                        value={newSchool.email}
                                        onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                                        placeholder="c2tantrao@..."
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Địa chỉ trường</label>
                                <input
                                    type="text"
                                    value={newSchool.address}
                                    onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                                    placeholder="Xã Tân Trào, huyện Sơn Dương..."
                                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
                                >
                                    {saving ? "Đang tạo..." : "Khởi Tạo Trường Mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
