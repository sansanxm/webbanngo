"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { stripHtml } from "@/lib/utils";
import DriveImage from "@/components/DriveImage";
import PageHeader from "@/components/PageHeader";

interface Post {
    id: string;
    title: string;
    category: string;
    imageUrl?: string;
    date: string;
    content: string;
}

export default function BulletinPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Filter posts by category "Thông báo"
                // Filter posts by category "Thông báo"
                const q = query(
                    collection(db, "posts"),
                    where("category", "==", "Thông báo")
                );
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[];

                // Sort by date descending (client-side)
                postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <PageHeader
                title="Bảng Tin"
                highlight="Thông Báo"
                description="Các thông báo chính thức và tin tức quan trọng từ nhà trường."
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((n) => (
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
                            <Link href={`/bulletin/read?id=${post.id}`} className="absolute inset-0 z-20" aria-label={post.title} />
                            <div className="relative h-48 overflow-hidden">
                                {post.imageUrl ? (
                                    <DriveImage
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center text-yellow-500">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className="bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
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
                                        Xem chi tiết
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
                    <svg className="w-16 h-16 mx-auto text-yellow-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-xl text-gray-500 font-medium">Hiện chưa có thông báo nào.</p>
                </div>
            )}
        </div>
    );
}
