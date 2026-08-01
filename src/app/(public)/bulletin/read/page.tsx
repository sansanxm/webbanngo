"use client";

import { useSearchParams } from "next/navigation";
import BulletinDetailClient from "../[id]/BulletinDetailClient";
import { Suspense } from "react";

function BulletinReadContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) return <div>Không tìm thấy bài viết.</div>;

    return <BulletinDetailClient id={id} />;
}

export default function BulletinReadPage() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <BulletinReadContent />
        </Suspense>
    );
}
