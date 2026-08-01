"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { stripHtml } from "@/lib/utils";
import DriveImage from "@/components/DriveImage";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";

interface Post {
    id: string;
    title: string;
    category: string;
    imageUrl?: string;
    date: string;
    content: string;
}

export default function NewsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryFilter = searchParams.get("cat");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = ["Tất cả", "Tin tức chung", "Chi bộ", "Hoạt động chuyên môn", "Công tác Bán trú", "Hoạt động Đội", "Y tế - Thư viện"];
    const activeTab = categoryFilter || "Tất cả";

    const handleTabChange = (tab: string) => {
        if (tab === "Tất cả") {
            router.push("/news");
        } else {
            router.push(`/news?cat=${encodeURIComponent(tab)}`);
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "posts"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);
                let postsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[];

                // Filter out notifications by default
                postsData = postsData.filter((post: any) => post.category !== "Thông báo");

                // Apply category filter if present in URL
                if (categoryFilter) {
                    postsData = postsData.filter(post => post.category === categoryFilter);
                }

                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [categoryFilter]);

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <PageHeader
                title="Tin Tức"
                highlight="Sự Kiện"
                description="Cập nhật những thông tin mới nhất về hoạt động của nhà trường."
            />

            <div className="mb-12">
                <FilterTabs
                    tabs={categories}
                    activeTab={activeTab}
                    onChange={handleTabChange}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 relative group"
                        >
                            <Link href={`/news/${post.id}`} className="absolute inset-0 z-20" aria-label={post.title} />
                            <div className="relative h-48 overflow-hidden">
                                {post.imageUrl ? (
                                    <DriveImage
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="bg-white text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider border border-blue-50">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-sm text-gray-500 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(post.date).toLocaleDateString("vi-VN")}
                                </div>

                                <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-gray-600 mb-4 line-clamp-3 flex-1 text-sm leading-relaxed">
                                    {stripHtml(post.content)}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <div className="inline-flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                        Đọc tiếp
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-xl text-gray-500 font-medium">Chưa có bài viết nào được đăng.</p>
                </div>
            )}
        </div>
    );
}
