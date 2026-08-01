"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";

interface Document {
    id: string;
    title: string;
    category: string;
    driveLink: string;
    date: string;
    order?: number;
}

export default function PublicDocumentsPage() {
    const searchParams = useSearchParams();
    const catParam = searchParams.get("cat");
    const idParam = searchParams.get("id");

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(catParam || "Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    // Sync filter with URL param if it changes
    useEffect(() => {
        if (catParam) {
            setFilter(catParam);
        }
    }, [catParam]);

    useEffect(() => {
        if (idParam && documents.length > 0) {
            const doc = documents.find((d) => d.id === idParam);
            if (doc) setSelectedDoc(doc);
        }
    }, [idParam, documents]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const q = query(collection(db, "documents"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);
                const docsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Document[];

                // Sort by order in memory (docs without order treated as 0 and go to bottom)
                docsData.sort((a, b) => {
                    const orderA = typeof a.order === 'number' ? a.order : 0;
                    const orderB = typeof b.order === 'number' ? b.order : 0;
                    if (orderA !== orderB) return orderB - orderA; // Descending
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });

                setDocuments(docsData);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const removeAccents = (str: string) => {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .toLowerCase();
    };

    const filteredDocs = documents.filter(doc => {
        const matchesCategory = filter === "Tất cả" || doc.category === filter;
        const normalizedTitle = removeAccents(doc.title);
        const normalizedQuery = removeAccents(searchQuery);
        const matchesSearch = normalizedTitle.includes(normalizedQuery);
        return matchesCategory && matchesSearch;
    });

    const categories = ["Tất cả", "Văn bản cấp trên", "Quyết định", "Báo cáo", "Kế hoạch", "Biểu mẫu", "Thông báo", "Khác"];

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <PageHeader
                title="Thư Viện"
                highlight="Văn Bản"
                description="Tra cứu và tải về các văn bản, quyết định công khai của nhà trường."
            />

            {/* Search & Filters */}
            <div className="mb-12 space-y-8">
                {/* Search Box */}
                <div className="max-w-2xl mx-auto relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm văn bản..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm text-gray-700 text-lg"
                    />
                    <svg className="w-6 h-6 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Category Filters */}
                <FilterTabs
                    tabs={categories}
                    activeTab={filter}
                    onChange={setFilter}
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {filteredDocs.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {filteredDocs.map((doc) => (
                                <li key={doc.id} className="p-6 hover:bg-blue-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between group">
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shadow-sm group-hover:bg-blue-200 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                                                {doc.title}
                                            </h3>
                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold uppercase">{doc.category}</span>
                                                <span>&bull;</span>
                                                <span>{new Date(doc.date).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedDoc(doc)}
                                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm group-hover:shadow-md"
                                        >
                                            <span>Xem</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <a
                                            href={doc.driveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm"
                                        >
                                            <span>Tải về</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="bg-gray-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy văn bản</h3>
                            <p className="text-gray-500 mt-2">Chưa có văn bản nào trong danh mục này.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDoc(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{selectedDoc.title}</h3>
                                <p className="text-sm text-gray-500">{selectedDoc.category} • {new Date(selectedDoc.date).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={selectedDoc.driveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span className="hidden sm:inline">Tải về</span>
                                </a>
                                <button onClick={() => setSelectedDoc(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 relative overflow-hidden">
                            {(() => {
                                // Helper to extract Drive ID
                                const getDriveId = (url: string) => {
                                    const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
                                    return match ? match[1] : null;
                                };

                                const isImage = (url: string) => /\.(jpeg|jpg|gif|png)$/i.test(url);
                                const driveId = getDriveId(selectedDoc.driveLink);

                                // Case 1: Google Drive Link (Manual Input)
                                if (driveId && selectedDoc.driveLink.includes("drive.google.com")) {
                                    return (
                                        <iframe
                                            src={`https://drive.google.com/file/d/${driveId}/preview`}
                                            className="w-full h-full border-0"
                                            title="Drive Preview"
                                            allow="autoplay"
                                        ></iframe>
                                    );
                                }

                                // Case 2: Direct Image (Storage or other)
                                if (isImage(selectedDoc.driveLink)) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                            <img src={selectedDoc.driveLink} alt="Preview" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    );
                                }

                                // Case 3: Other files (PDF, Word, Excel from Storage) -> Use GView
                                return (
                                    <iframe
                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedDoc.driveLink)}&embedded=true`}
                                        className="w-full h-full border-0"
                                        title="Document Preview"
                                    ></iframe>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
