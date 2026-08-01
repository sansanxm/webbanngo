"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import DriveImage from "@/components/DriveImage";
import PageHeader from "@/components/PageHeader";

interface SearchResult {
    id: string;
    title: string;
    type: "news" | "bulletin" | "document" | "resource";
    date: string;
    category?: string;
    link: string;
    thumbnail?: string;
}

export default function GlobalSearchPage() {
    const [queryStr, setQueryStr] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    const [allData, setAllData] = useState<SearchResult[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch News
                const newsSnap = await getDocs(query(collection(db, "posts"), orderBy("date", "desc")));
                const newsItems = newsSnap.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title,
                    type: "news" as const,
                    date: doc.data().date,
                    category: doc.data().category,
                    link: `/news/${doc.id}`,
                    thumbnail: doc.data().coverImage
                }));

                // Fetch Bulletins
                const bulletinSnap = await getDocs(query(collection(db, "bulletins"), orderBy("date", "desc")));
                const bulletinItems = bulletinSnap.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title,
                    type: "bulletin" as const,
                    date: doc.data().date,
                    link: `/bulletin?id=${doc.id}`,
                    thumbnail: doc.data().coverImage
                }));

                // Fetch Documents
                const docSnap = await getDocs(query(collection(db, "documents"), orderBy("date", "desc")));
                const docItems = docSnap.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title,
                    type: "document" as const,
                    date: doc.data().date,
                    category: doc.data().category,
                    link: "/documents", // Link to document listing for now
                }));

                // Fetch Resources
                const resSnap = await getDocs(query(collection(db, "resources"), orderBy("date", "desc")));
                const resItems = resSnap.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title,
                    type: "resource" as const,
                    date: doc.data().date,
                    category: doc.data().category,
                    link: "/resources",
                    thumbnail: doc.data().thumbnail || doc.data().link
                }));

                const combined = [...newsItems, ...bulletinItems, ...docItems, ...resItems];
                setAllData(combined);
            } catch (error) {
                console.error("Error fetching data for search:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const removeAccents = (str: string) => {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .toLowerCase();
    };

    const handleSearch = (val: string) => {
        setQueryStr(val);
        if (!val.trim()) {
            setResults([]);
            return;
        }

        setSearching(true);
        const normalizedQuery = removeAccents(val);
        const filtered = allData.filter(item =>
            removeAccents(item.title).includes(normalizedQuery) ||
            (item.category && removeAccents(item.category).includes(normalizedQuery))
        );
        setResults(filtered);
        setSearching(false);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "news": return "Tin tức";
            case "bulletin": return "Bảng tin";
            case "document": return "Văn bản";
            case "resource": return "Tài nguyên";
            default: return "";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "news": return "bg-blue-100 text-blue-700";
            case "bulletin": return "bg-yellow-100 text-yellow-700";
            case "document": return "bg-green-100 text-green-700";
            case "resource": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <PageHeader
                title="Tìm Kiếm"
                highlight="Toàn Trang"
                description="Tìm kiếm nhanh chóng tin tức, văn bản, bảng tin và tài nguyên của nhà trường."
            />

            {/* Search Box */}
            <div className="relative mb-12 max-w-2xl mx-auto">
                <input
                    type="text"
                    placeholder="Nhập nội dung cần tìm (có dấu hoặc không dấu)..."
                    value={queryStr}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-[2.5rem] bg-white shadow-2xl shadow-blue-900/10 border border-gray-100 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-medium"
                    autoFocus
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Đang đồng bộ dữ liệu...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {queryStr && results.length === 0 && !searching && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Không tìm thấy kết quả</h3>
                            <p className="text-gray-500 mt-2">Vui lòng thử từ khóa khác hoặc kiểm tra tính chính xác của từ khóa.</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="grid grid-cols-1 gap-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tìm thấy {results.length} kết quả</p>
                            {results.map((item) => (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href={item.link}
                                    className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex items-center gap-6"
                                >
                                    {/* Thumbnail Preview */}
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden relative">
                                        {item.thumbnail ? (
                                            <DriveImage
                                                src={item.thumbnail}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={item.title}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getTypeColor(item.type)}`}>
                                                {getTypeLabel(item.type)}
                                            </span>
                                            {item.category && (
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    &bull; {item.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.date).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>

                                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
