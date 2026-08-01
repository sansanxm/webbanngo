"use client";

import { useEffect, useState, Suspense } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import BannerSlideshow from "@/components/BannerSlideshow";
import ResourceViewer from "@/components/ResourceViewer";
import DriveImage from "@/components/DriveImage";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";

interface Resource {
    id: string;
    title: string;
    category: string;
    link: string;
    links?: string[];
    thumbnail?: string;
    displayMode: "single" | "folder" | "slideshow";
    date: string;
}

function ResourcesContent() {
    const searchParams = useSearchParams();
    const catParam = searchParams.get("cat");
    const idParam = searchParams.get("id");

    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    // Sync filter with URL param
    useEffect(() => {
        if (catParam) {
            setFilter(catParam);
        } else {
            setFilter("Tất cả");
        }
    }, [catParam]);

    useEffect(() => {
        if (idParam && allResources.length > 0) {
            const res = allResources.find((r) => r.id === idParam);
            if (res) setSelectedResource(res);
        }
    }, [idParam, allResources]);

    useEffect(() => {
        const fetchAllResources = async () => {
            setLoading(true);
            try {
                // Fetch ALL resources once to allow instant client-side filtering
                const q = query(collection(db, "resources"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    displayMode: doc.data().displayMode || "single",
                })) as Resource[];

                setAllResources(data);
            } catch (error) {
                console.error("Error fetching resources:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllResources();
    }, []);

    const removeAccents = (str: string) => {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .toLowerCase();
    };

    const filteredResources = allResources.filter((res) => {
        const matchesCategory = filter === "Tất cả" || res.category === filter;
        const normalizedTitle = removeAccents(res.title);
        const normalizedQuery = removeAccents(searchQuery);
        const matchesSearch = normalizedTitle.includes(normalizedQuery);
        return matchesCategory && matchesSearch;
    });

    const categories = ["Thư viện Ảnh", "Video Clip", "Học liệu", "Phần mềm - Ứng dụng", "Sản phẩm của Học sinh"];

    const getIcon = (cat: string) => {
        switch (cat) {
            case "Thư viện Ảnh": return <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case "Video Clip": return <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
            case "Học liệu": return <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4 1.253" /></svg>;
            case "Phần mềm - Ứng dụng": return <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
            case "Sản phẩm của Học sinh": return <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
            default: return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        }
    };

    const extractYoutubeId = (url: string) => {
        const match = url?.match(/(?:\?v=|&v=|youtu\.be\/|\/embed\/|\/watch\?v=)([^#\&\?]*)/);
        return match && match[1].length === 11 ? match[1] : null;
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <PageHeader
                    title="Kho"
                    highlight="Tài nguyên"
                />

                {/* Search & Category Filter */}
                <div className="mb-20 space-y-8">
                    {/* Search Box */}
                    <div className="max-w-2xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài nguyên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm text-gray-700 text-lg"
                        />
                        <svg className="w-6 h-6 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <FilterTabs
                        tabs={["Tất cả", ...categories]}
                        activeTab={filter}
                        onChange={setFilter}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white rounded-[2.5rem] h-[28rem] animate-pulse border border-gray-100 shadow-sm" />
                        ))}
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
                        {filteredResources.map((res) => (
                            <div
                                key={res.id}
                                onClick={() => setSelectedResource(res)}
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col transition-all duration-500 cursor-pointer relative hover:-translate-y-2"
                            >
                                {/* Card Media Preview */}
                                <div className="relative h-60 overflow-hidden bg-gray-900">
                                    {/* Subtle Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />

                                    {res.thumbnail ? (
                                        <div className="h-full overflow-hidden">
                                            <DriveImage
                                                src={res.thumbnail}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={res.title}
                                                fallback={
                                                    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-white">
                                                        <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                                            <div className="mb-4 flex justify-center drop-shadow-sm">{getIcon(res.category)}</div>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                        </div>
                                    ) : res.displayMode === 'slideshow' && res.links && res.links.length > 0 ? (
                                        <div className="h-full scale-105 group-hover:scale-110 transition-transform duration-700">
                                            <BannerSlideshow images={res.links} />
                                        </div>
                                    ) : extractYoutubeId(res.link) ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <img
                                                src={`https://img.youtube.com/vi/${extractYoutubeId(res.link)}/maxresdefault.jpg`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${extractYoutubeId(res.link)}/0.jpg`;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl ring-8 ring-white/10 group-hover:scale-110 group-hover:bg-red-500 transition-all duration-500">
                                                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-white">
                                            <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                                <div className="mb-4 flex justify-center drop-shadow-sm">{getIcon(res.category)}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-6 left-6 z-20">
                                        <span className={`text-[10px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest border border-white/20 backdrop-blur-md ${res.category === 'Thư viện Ảnh' ? 'bg-orange-500/90 text-white' :
                                            res.category === 'Video Clip' ? 'bg-red-500/90 text-white' :
                                                res.category === 'Phần mềm - Ứng dụng' ? 'bg-purple-500/90 text-white' :
                                                    res.category === 'Sản phẩm của Học sinh' ? 'bg-yellow-500/90 text-white shadow-yellow-200/50' :
                                                        'bg-green-500/90 text-white'
                                            }`}>
                                            {res.category}
                                        </span>
                                    </div>

                                    {/* New Tab Button specifically for Apps */}
                                    {res.category === "Phần mềm - Ứng dụng" && res.link && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(res.link, '_blank');
                                            }}
                                            className="absolute top-6 right-6 z-30 bg-white/95 backdrop-blur-md text-purple-600 p-3 rounded-2xl shadow-xl hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110 border border-purple-50 group/tab"
                                            title="Mở trong tab mới"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="text-xl font-black text-gray-800 leading-[1.4] mb-6 group-hover:text-blue-700 transition-colors line-clamp-2">
                                        {res.title}
                                    </h3>

                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                {new Date(res.date).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                        <div className="text-blue-600 font-black text-[10px] inline-flex items-center group-hover:translate-x-1.5 transition-transform uppercase tracking-[0.2em]">
                                            CHI TIẾT
                                            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-gray-100 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-200">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-400 font-black uppercase tracking-[0.3em]">Chưa có tài nguyên</p>
                    </div>
                )}

                {/* Detail View Modal */}
                <AnimatePresence>
                    {selectedResource && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedResource(null)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${selectedResource.category === 'Thư viện Ảnh' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                selectedResource.category === 'Video Clip' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    selectedResource.category === 'Sản phẩm của Học sinh' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-green-100 text-green-700 border-green-200'
                                                }`}>
                                                {selectedResource.category}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">{new Date(selectedResource.date).toLocaleDateString("vi-VN")}</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-gray-800 line-clamp-1">{selectedResource.title}</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedResource(null)}
                                        className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Modal Body (Viewer) */}
                                <div className="flex-1 bg-gray-900 overflow-hidden relative">
                                    <ResourceViewer
                                        type={selectedResource.displayMode}
                                        link={selectedResource.link}
                                        links={selectedResource.links}
                                        category={selectedResource.category}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

export default function ResourcesPage() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <ResourcesContent />
        </Suspense>
    );
}
