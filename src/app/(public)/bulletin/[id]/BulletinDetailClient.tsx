"use client";

import { useEffect, useState, Suspense } from "react";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import PostContent from "@/components/PostContent";
import EmbeddedLink from "@/components/EmbeddedLink";
import ShareButtons from "@/components/ShareButtons";
import DriveImage from "@/components/DriveImage";

interface Post {
    id: string;
    title: string;
    category: string;
    imageUrl?: string;
    date: string;
    content: string;
    embeddedLink?: string;
    views?: number;
    author?: string;
}

interface BulletinDetailContentProps {
    id: string;
}

function BulletinDetailContent({ id }: BulletinDetailContentProps) {
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

                    // Fetch related bulletins (latest 3 excluding current)
                    const q = query(
                        collection(db, "posts"),
                        where("category", "==", "Thông báo")
                    );
                    const querySnapshot = await getDocs(q);
                    const allBulletins = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

                    // Sort descending
                    allBulletins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    const related = allBulletins
                        .filter(p => p.id !== id)
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
                <div className="h-8 bg-yellow-100 rounded w-3/4"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy thông báo</h2>
                <Link href="/bulletin" className="text-yellow-600 hover:underline">Quay lại Bảng Tin</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/bulletin" className="text-yellow-600 hover:text-yellow-800 flex items-center mb-4 transition-colors font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Quay lại Bảng Tin
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold">
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

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                    {post.title}
                </h1>
            </div>

            {post.imageUrl && (
                <div className="mb-10 text-center">
                    <DriveImage
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full max-w-[75%] h-auto rounded-lg shadow-md object-contain max-h-[85vh] mx-auto block border-4 border-yellow-100"
                    />
                </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-yellow-100">
                <PostContent content={post.content} />
                <div className="mt-8">
                    <EmbeddedLink url={post.embeddedLink} />
                </div>
            </div>

            {/* Author Section */}
            {post.author && (
                <div className="mt-8 mb-4 flex justify-end">
                    <p className="text-gray-700 italic font-bold text-lg">
                        {post.author}
                    </p>
                </div>
            )}

            {/* Related Bulletins */}
            {relatedPosts.length > 0 && (
                <div className="mt-12 border-t border-yellow-200 pt-8">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                        <span className="w-2 h-8 bg-yellow-500 mr-2 rounded-full"></span>
                        Thông báo khác
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedPosts.map(p => (
                            <Link key={p.id} href={`/bulletin/read?id=${p.id}`} className="group">
                                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="text-xs text-gray-500 mb-2">{new Date(p.date).toLocaleDateString("vi-VN")}</div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-yellow-700 line-clamp-2 transition-colors mb-2">
                                        {p.title}
                                    </h4>
                                    <span className="text-yellow-600 text-sm font-semibold mt-auto flex items-center">
                                        Xem ngay &rarr;
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BulletinDetailClient({ id }: BulletinDetailContentProps) {
    return (
        <Suspense fallback={<div>Đang tải thông báo...</div>}>
            <BulletinDetailContent id={id} />
        </Suspense>
    );
}
