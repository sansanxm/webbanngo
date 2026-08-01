"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Link from "next/link";

interface Post {
    id: string;
    title: string;
    category: string;
    date: any;
    imageUrl?: string;
}

export default function BulletinParams() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            // Only fetch posts with category "Thông báo"
            const q = query(collection(db, "posts"), where("category", "==", "Thông báo"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];

            // Sort by date descending (client-side to avoid composite index requirement)
            postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl?: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa thông báo này không?")) {
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
                alert("Xóa thông báo thất bại.");
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách thông báo...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-yellow-600">Quản Lý Bảng Tin</h1>
                <Link
                    href="/admin/bulletin/create"
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 shadow-sm font-medium"
                >
                    + Thêm Thông Báo Mới
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-yellow-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-yellow-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-700 uppercase tracking-wider">
                                    Tiêu đề thông báo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-700 uppercase tracking-wider">
                                    Ngày đăng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {posts.map((post) => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">
                                            {post.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(post.date).toLocaleDateString("vi-VN")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            href={`/admin/bulletin/edit?id=${post.id}`}
                                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors inline-block"
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
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p>Chưa có thông báo nào trong Bảng tin.</p>
                        <Link href="/admin/bulletin/create" className="text-yellow-600 font-bold mt-2 hover:underline">
                            Tạo thông báo đầu tiên
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
