"use client";

import BulletinForm from "@/components/BulletinForm";

export default function CreateBulletinPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                Tạo Thông Báo Mới (Bảng Tin)
            </h1>
            <BulletinForm
                redirectBaseUrl="/admin/bulletin"
            />
        </div>
    );
}
