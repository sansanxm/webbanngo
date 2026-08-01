"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Resource {
    id: string;
    title: string;
    category: string;
    link: string;
    links?: string[]; // For slideshow
    thumbnail?: string;
    displayMode: "single" | "folder" | "slideshow";
    date: string;
}

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Thư viện Ảnh");
    const [link, setLink] = useState("");
    const [multipleLinks, setMultipleLinks] = useState(""); // For textarea
    const [thumbnail, setThumbnail] = useState("");
    const [displayMode, setDisplayMode] = useState<"single" | "slideshow">("single");
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchResources = async () => {
        try {
            const q = query(collection(db, "resources"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                displayMode: doc.data().displayMode || "single", // Default for old data
            })) as Resource[];
            setResources(data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const linksArray = multipleLinks
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l.length > 0);

            const resourceData: any = {
                title,
                category,
                link: displayMode === "single" ? link : (linksArray[0] || ""),
                links: displayMode === "slideshow" ? linksArray : [],
                thumbnail,
                displayMode,
                date: new Date().toISOString(),
            };

            if (editingId) {
                await updateDoc(doc(db, "resources", editingId), resourceData);
                setEditingId(null);
            } else {
                await addDoc(collection(db, "resources"), resourceData);
            }

            setTitle("");
            setLink("");
            setMultipleLinks("");
            setThumbnail("");
            setDisplayMode("single");
            fetchResources();
            alert("Đã lưu tài nguyên thành công!");
        } catch (error) {
            console.error("Error saving resource:", error);
            alert("Lỗi khi lưu tài nguyên");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài nguyên này?")) {
            try {
                await deleteDoc(doc(db, "resources", id));
                fetchResources();
            } catch (error) {
                console.error("Error deleting resource:", error);
            }
        }
    };

    const handleEdit = (resource: Resource) => {
        setEditingId(resource.id);
        setTitle(resource.title);
        setCategory(resource.category);
        setLink(resource.link || "");
        setMultipleLinks(resource.links?.join("\n") || "");
        setThumbnail(resource.thumbnail || "");
        setDisplayMode(resource.displayMode === "slideshow" ? "slideshow" : "single");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-black uppercase tracking-wider border-b-2 border-blue-600 pb-2 inline-block">
                Quản lý Tài nguyên
            </h1>

            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 text-blue-700">
                    {editingId ? "Chỉnh sửa tài nguyên" : "Thêm tài nguyên mới"}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề tài nguyên</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Ví dụ: Lễ khai giảng năm học 2023-2024"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Loại tài nguyên</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Thư viện Ảnh">Thư viện Ảnh</option>
                            <option value="Video Clip">Video Clip</option>
                            <option value="Học liệu">Học liệu</option>
                            <option value="Phần mềm - Ứng dụng">Phần mềm - Ứng dụng</option>
                            <option value="Sản phẩm của Học sinh">Sản phẩm của Học sinh</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Hình đại diện (URL)</label>
                        <input
                            type="url"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="Link ảnh đại diện (tùy chọn)..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Chế độ hiển thị</label>
                        <select
                            value={displayMode}
                            onChange={(e) => setDisplayMode(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="single">Link đơn (Web App / Video / PDF)</option>
                            <option value="slideshow">Bộ sưu tập (Nhiều ảnh/video)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            {displayMode === "single" ? "Đường dẫn (Link Web / YouTube / PDF)" : "Danh sách Link (Mỗi link một dòng)"}
                        </label>
                        {displayMode === "single" ? (
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                required
                                placeholder="Dán link vào đây..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        ) : (
                            <textarea
                                value={multipleLinks}
                                onChange={(e) => setMultipleLinks(e.target.value)}
                                required
                                rows={8}
                                placeholder="Dán các link vào đây, mỗi link một dòng..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            />
                        )}
                        <p className="mt-1 text-xs text-blue-600 font-medium italic">
                            {displayMode === "single"
                                ? "* Ghi chú: Sử dụng link này để nhúng ứng dụng Flutter Web, Video YouTube hoặc văn bản trực tiếp."
                                : "* Ghi chú: Hệ thống sẽ tự động biến các link này thành bộ sưu tập Slideshow/Thư viện để phụ huynh xem và tải ảnh."}
                        </p>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setTitle("");
                                    setLink("");
                                    setMultipleLinks("");
                                    setThumbnail("");
                                    setDisplayMode("single");
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-bold"
                            >
                                Hủy bỏ
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold transition-colors shadow-md"
                        >
                            {editingId ? "Cập nhật" : "Lưu tài nguyên"}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Tiêu đề tài nguyên</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Loại</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Chế độ</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Ngày đăng</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                            </tr>
                        ) : resources.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chưa có tài nguyên nào.</td>
                            </tr>
                        ) : (
                            resources.map((res) => (
                                <tr key={res.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{res.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-xs text-blue-600 truncate max-w-[400px]">{res.link || (res.links?.[0] + "...")}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${res.category === 'Thư viện Ảnh' ? 'bg-orange-100 text-orange-700' :
                                            res.category === 'Video Clip' ? 'bg-red-100 text-red-700' :
                                                res.category === 'Phần mềm - Ứng dụng' ? 'bg-purple-100 text-purple-700' :
                                                    res.category === 'Sản phẩm của Học sinh' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                            }`}>
                                            {res.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                            {res.displayMode === 'slideshow' ? '🎞️ Bộ sưu tập' : '🔗 Link đơn'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(res.date).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(res)}
                                            className="text-blue-600 hover:text-blue-800 font-bold mr-4 text-sm"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(res.id)}
                                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
