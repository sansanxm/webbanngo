"use client";

import { useEffect, useState, Suspense } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import PostForm from "@/components/PostForm";
import { useSearchParams, useRouter } from "next/navigation";

function EditPostContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    const handleDelete = async () => {
        if (!id || !post) return;
        if (confirm("Bạn có chắc chắn muốn xóa bài viết này không? (Hành động này sẽ xóa vĩnh viễn tin bài và ảnh bìa)")) {
            try {
                // Delete image from storage if it exists and is a Firebase Storage URL
                if (post.imageUrl && post.imageUrl.includes("firebasestorage.googleapis.com")) {
                    try {
                        const imageRef = ref(storage, post.imageUrl);
                        await deleteObject(imageRef);
                    } catch (storageError) {
                        console.error("Error deleting image from storage:", storageError);
                    }
                }

                await deleteDoc(doc(db, "posts", id));
                router.push("/admin/posts");
                router.refresh();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Xóa bài viết thất bại.");
            }
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (!post) return <div>Không tìm thấy bài viết</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Chỉnh Sửa Bài Viết</h1>
            <PostForm initialData={post} onDelete={handleDelete} />
        </div>
    );
}

export default function EditPostPage() {
    return (
        <Suspense fallback={<div>Đang tải form...</div>}>
            <EditPostContent />
        </Suspense>
    );
}
