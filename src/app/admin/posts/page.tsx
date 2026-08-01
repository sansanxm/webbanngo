"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
    id: string;
    title: string;
    category: string;
    date: any;
    imageUrl?: string;
}

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, "posts"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((post: any) => post.category !== "Thông báo") as Post[];
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl?: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            try {
                // Delete image from storage if it exists and is a Firebase Storage URL
                if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
                    try {
                        const imageRef = ref(storage, imageUrl);
                        await deleteObject(imageRef);
                    } catch (storageError) {
                        console.error("Error deleting image from storage:", storageError);
                    }
                }

                await deleteDoc(doc(db, "posts", id));
                setPosts(posts.filter((post) => post.id !== id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Xóa bài viết thất bại.");
            }
        }
    };

    if (loading) return <div>Đang tải danh sách...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Tin Tức & Hoạt Động</h1>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/posts/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Thêm Bài Viết
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tiêu đề
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {posts.map((post) => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {post.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            href={`/admin/posts/edit?id=${post.id}`}
                                            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition-colors inline-block"
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id, post.imageUrl)}
                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {posts.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Chưa có bài viết nào. Hãy thêm bài viết mới.
                    </div>
                )}
            </div>
        </div>
    );
}
