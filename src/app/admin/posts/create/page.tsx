import PostForm from "@/components/PostForm";

export default function CreatePostPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Tạo Bài Viết Mới</h1>
            <PostForm />
        </div>
    );
}
