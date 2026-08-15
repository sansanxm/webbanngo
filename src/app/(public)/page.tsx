"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { stripHtml } from "@/lib/utils";
import Link from "next/link";
import DriveImage from "@/components/DriveImage";
import BannerSlideshow from "@/components/BannerSlideshow";
import SchoolStats from "@/components/SchoolStats";
import AnimatedColumn from "@/components/AnimatedColumn";
import SlideshowColumn from "@/components/SlideshowColumn";
import WeeklySchedule from "@/components/WeeklySchedule";
import { useSettings } from "@/context/SettingsContext"; // Import context

interface Post {
    id: string;
    title: string;
    category: string;
    imageUrl?: string;
    date: string;
    content: string; // for snippet
}

interface DocumentItem {
    id: string;
    title: string;
    category: string;
    driveLink: string;
    date: string;
}

interface ResourceItem {
    id: string;
    title: string;
    category: string;
    link: string;
    thumbnail?: string;
    displayMode?: string;
    date: string;
}

export default function HomePage() {
    const { settings } = useSettings(); // Get settings
    const [posts, setPosts] = useState<Post[]>([]);
    const [bulletins, setBulletins] = useState<Post[]>([]);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Posts (increased limit to ensure we get news items even if bulletins are recent)
                const qPosts = query(collection(db, "posts"), orderBy("date", "desc"), limit(50));

                // Fetch Bulletins
                const qBulletins = query(collection(db, "posts"), where("category", "==", "Thông báo"));

                // Fetch Documents (6 items)
                const qDocs = query(collection(db, "documents"), orderBy("date", "desc"), limit(6));

                // Fetch Resources (6 items)
                const qRes = query(collection(db, "resources"), orderBy("date", "desc"), limit(6));

                const [postsSnap, bulletinsSnap, docsSnap, resSnap] = await Promise.all([
                    getDocs(qPosts),
                    getDocs(qBulletins),
                    getDocs(qDocs),
                    getDocs(qRes),
                ]);

                const postsData = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((post: any) => post.category !== "Thông báo")
                    .slice(0, 6) as Post[];
                setPosts(postsData);

                const bulletinsData = bulletinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
                bulletinsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setBulletins(bulletinsData.slice(0, 6));

                const docsData = docsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DocumentItem[];
                setDocuments(docsData);

                const resData = resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ResourceItem[];
                setResources(resData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-16">
            {/* Top Section: Banner and Bulletin */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Banner / Welcome Section (Takes 2 columns) */}
                <section className="relative rounded-2xl overflow-hidden shadow-2xl text-white flex flex-col justify-end items-center text-center group md:col-span-2 aspect-[16/10]">
                    {/* Slideshow Background */}
                    <div className="absolute inset-0 z-0">
                        <BannerSlideshow
                            images={settings.bannerImages && settings.bannerImages.length > 0 ? settings.bannerImages : (settings.bannerUrl ? [settings.bannerUrl] : [])}
                        />
                    </div>

                    {/* Bottom Content: Buttons Only (No Text) */}
                    <div className="z-10 w-full pb-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/about" className="px-8 py-3 bg-yellow-400 text-blue-900 rounded-full font-bold shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all">
                                TÌM HIỂU THÊM
                            </Link>
                            <Link href="/news" className="px-8 py-3 bg-white/20 backdrop-blur text-white rounded-full font-bold shadow-lg hover:bg-white/30 hover:scale-105 transition-all border border-white/40">
                                XEM TIN TỨC
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Bulletin Section (Takes 1 column) */}
                <div className="md:col-span-1 aspect-[16/10] md:aspect-auto">
                    {loading ? (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                    ) : (
                        <SlideshowColumn
                            title="Thông báo"
                            icon={<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                            items={bulletins}
                            emptyMessage="Chưa có thông báo mới"
                            viewAllHref="/bulletin"
                            themeColor="red"
                            className="h-full"
                            interval={5000}
                            renderItem={(post) => (
                                <Link href={`/bulletin/read?id=${post.id}`} className="block w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-red-200 dark:hover:border-red-900/40 transition-all group group/link overflow-hidden flex flex-col pt-2 relative z-10 pb-4">
                                    <div className="w-full h-3/5 relative overflow-hidden bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-400 shrink-0">
                                        {post.imageUrl ? (
                                            <DriveImage src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover/link:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                        )}
                                        <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">MỚI</div>
                                    </div>
                                    <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
                                        <div className="text-[14px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(post.date).toLocaleDateString("vi-VN")}
                                        </div>
                                        <h4 className="text-[20px] md:text-[22px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 md:line-clamp-3 group-hover/link:text-red-700 dark:group-hover:text-red-400 transition-colors leading-snug">
                                            {post.title}
                                        </h4>
                                    </div>
                                </Link>
                            )}
                        />
                    )}
                </div>
            </div>


            {/* 3-Column Content Layout */}
            <section className="mt-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[600px]">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Column 1: News */}
                        <AnimatedColumn
                            title="Tin tức"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                            items={posts}
                            emptyMessage="Chưa có tin tức mới"
                            viewAllHref="/news"
                            themeColor="blue"
                            renderItem={(post) => (
                                <Link href={`/news/${post.id}`} className="block bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-900/40 transition-all group flex gap-4 h-28">
                                    <div className="w-24 h-full rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                                        {post.imageUrl ? (
                                            <DriveImage src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                                        <div className="text-[12px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
                                            {new Date(post.date).toLocaleDateString("vi-VN")}
                                        </div>
                                        <h4 className="text-[16px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                                            {post.title}
                                        </h4>
                                    </div>
                                </Link>
                            )}
                        />

                        {/* Column 2: Documents */}
                        <AnimatedColumn
                            title="Văn bản"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            items={documents}
                            emptyMessage="Chưa có văn bản công khai"
                            viewAllHref="/documents"
                            themeColor="green"
                            renderItem={(doc) => (
                                <Link href={`/documents?cat=${doc.category}`} className="block bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-green-900/10 hover:border-green-200 dark:hover:border-green-900/40 transition-all group">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-[12px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1 bg-green-50 dark:bg-green-900/30 inline-block px-2 py-0.5 rounded-sm">
                                                {doc.category}
                                            </div>
                                            <h4 className="text-[16px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors leading-snug">
                                                {doc.title}
                                            </h4>
                                            <div className="text-[14px] text-gray-400 dark:text-gray-500 mt-2">
                                                {new Date(doc.date).toLocaleDateString("vi-VN")}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />

                        {/* Column 3: Resources */}
                        <AnimatedColumn
                            title="Tài nguyên"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                            items={resources}

                            emptyMessage="Chưa có tài nguyên"
                            viewAllHref="/resources"
                            themeColor="purple"
                            renderItem={(res) => (
                                <Link href={`/resources?cat=${res.category}`} className="block bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-purple-900/10 hover:border-purple-200 dark:hover:border-purple-900/40 transition-all group flex gap-4 h-24">
                                    <div className="w-20 h-full rounded-xl overflow-hidden shrink-0 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-400">
                                        {res.thumbnail ? (
                                            <DriveImage src={res.thumbnail} alt={res.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={res.category === 'Video Clip' ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"} />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                                        <div className="flex items-center gap-1 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider truncate">
                                                {res.category}
                                            </div>
                                        </div>
                                        <h4 className="text-[16px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                                            {res.title}
                                        </h4>
                                    </div>
                                </Link>
                            )}
                        />
                    </div>
                )}
            </section>

            {/* School Stats Section */}
            <div className="mt-16">
                <SchoolStats />
            </div>

            {/* Weekly Schedule Section */}
            <WeeklySchedule />
        </div>
    );
}
