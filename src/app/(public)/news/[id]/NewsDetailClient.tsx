"use client";

import { useEffect, useState, Suspense } from "react";
import { doc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import PostContent from "@/components/PostContent";
import EmbeddedLink from "@/components/EmbeddedLink";
import ShareButtons from "@/components/ShareButtons";
import DriveImage from "@/components/DriveImage";

interface Post {
    id: string;
    title: string;
    introduction?: string;
    category: string;
    imageUrl?: string;
    date: string;
    content: string;
    embeddedLink?: string;
    views?: number;
    author?: string;
}

interface NewsDetailContentProps {
    id: string;
}

function NewsDetailContent({ id }: NewsDetailContentProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostAndRelated = async () => {
            if (!id) return;
            try {
                // Fetch current post
                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const postData = { id: docSnap.id, ...docSnap.data() } as Post;
                    setPost(postData);

                    // Fetch related posts (latest excluding current and excluding Bulletins)
                    const q = query(
                        collection(db, "posts"),
                        orderBy("date", "desc"),
                        limit(10)
                    );
                    const querySnapshot = await getDocs(q);
                    const related = querySnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as Post))
                        .filter(p => p.id !== id && p.category !== "Thông báo")
                        .slice(0, 3);

                    setRelatedPosts(related);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }

            // Increment views
            try {
                const viewedKey = `viewed_post_${id}`;
                if (typeof window !== 'undefined' && !sessionStorage.getItem(viewedKey)) {
                    const postRef = doc(db, "posts", id);
                    await updateDoc(postRef, {
                        views: increment(1)
                    });
                    sessionStorage.setItem(viewedKey, "true");

                    // Optimistically update UI
                    setPost(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
                }
            } catch (error) {
                console.error("Error incrementing views:", error);
            }
        };

        fetchPostAndRelated();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Không tìm thấy bài viết</h2>
                <Link href="/news" className="text-blue-600 dark:text-blue-400 hover:underline">Quay lại danh sách tin tức</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/news" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center mb-4 transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Quay lại tin tức
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
                        {post.category}
                    </span>
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(post.date).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {post.views || 0} lượt xem
                    </span>
                    <div className="ml-auto md:ml-4">
                        <ShareButtons title={post.title} compact={true} />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                    {post.title}
                </h1>

                {post.introduction && (
                    <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed mb-6 border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50/50 dark:bg-blue-900/20 rounded-r-lg text-justify whitespace-pre-wrap" style={{ tabSize: '1.27cm' } as React.CSSProperties}>
                        {post.introduction}
                    </div>
                )}
            </div>

            {post.imageUrl && (
                <div className="mb-10 text-center">
                    <DriveImage
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full max-w-[75%] h-auto rounded-lg shadow-md object-contain max-h-[85vh] mx-auto block"
                        fallback={
                            <div className="p-8 text-center bg-gray-100 text-red-500">
                                <p>Không tải được ảnh bìa.</p>
                                <a href={post.imageUrl} target="_blank" className="underline text-blue-600">Xem ảnh gốc</a>
                            </div>
                        }
                    />
                </div>
            )}

            <PostContent content={post.content} />
            <div className="mt-8">
                <EmbeddedLink url={post.embeddedLink} />
            </div>

            {post.author && (
                <div className="mt-8 mb-4 flex justify-end">
                    <p className="text-gray-700 dark:text-gray-300 italic font-bold text-lg">
                        {post.author}
                    </p>
                </div>
            )}


            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-10">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Tin tức liên quan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedPosts.map(p => (
                            <Link key={p.id} href={`/news/${p.id}`} className="group">
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-900/10 transition-shadow h-full flex flex-col">
                                    <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {p.imageUrl ? (
                                            <DriveImage src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{new Date(p.date).toLocaleDateString("vi-VN")}</div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                                            {p.title}
                                        </h4>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NewsDetailClient({ id }: NewsDetailContentProps) {
    return (
        <Suspense fallback={<div>Đang tải nội dung...</div>}>
            <NewsDetailContent id={id} />
        </Suspense>
    );
}
