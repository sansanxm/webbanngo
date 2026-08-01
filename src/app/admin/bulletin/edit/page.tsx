"use client";

import BulletinForm from "@/components/BulletinForm";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

function EditBulletinContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            const docRef = doc(db, "posts", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setInitialData({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        };
        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        if (!id || !initialData) return;
        if (confirm("Bạn có chắc chắn muốn xóa thông báo này không? (Hành động này sẽ xóa vĩnh viễn thông báo và ảnh liên quan)")) {
            try {
                // Delete image from storage if it exists and is a Firebase Storage URL
                if (initialData.imageUrl && initialData.imageUrl.includes("firebasestorage.googleapis.com")) {
                    try {
                        const imageRef = ref(storage, initialData.imageUrl);
                        await deleteObject(imageRef);
                    } catch (storageError) {
                        console.error("Error deleting image from storage:", storageError);
                    }
                }

                await deleteDoc(doc(db, "posts", id));
                router.push("/admin/bulletin");
                router.refresh();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Xóa thông báo thất bại.");
            }
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (!initialData) return <div>Không tìm thấy bài viết.</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                Chỉnh Sửa Thông Báo
            </h1>
            <BulletinForm
                initialData={initialData}
                redirectBaseUrl="/admin/bulletin"
                onDelete={handleDelete}
            />
        </div>
    );
}

export default function EditBulletinPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditBulletinContent />
        </Suspense>
    );
}
