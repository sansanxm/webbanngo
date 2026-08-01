"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface Document {
    id: string;
    title: string;
    category: string;
    driveLink: string;
    driveId?: string;
    storagePath?: string;
    date: string;
    order?: number;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Kế hoạch");
    const [file, setFile] = useState<File | null>(null);
    const [manualLink, setManualLink] = useState("");

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            // Sort by date from DB first to ensure all docs are fetched
            const q = query(collection(db, "documents"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const docsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Document[];

            // Sort by order in memory. Docs without order go to the bottom (treated as 0 or negative)
            docsData.sort((a, b) => {
                const orderA = typeof a.order === 'number' ? a.order : 0;
                const orderB = typeof b.order === 'number' ? b.order : 0;
                if (orderA !== orderB) return orderB - orderA; // Descending
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            setDocuments(docsData);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (doc: Document) => {
        setEditingId(doc.id);
        setTitle(doc.title);
        setCategory(doc.category);
        setManualLink(doc.driveLink);
        setFile(null); // Reset file input

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTitle("");
        setCategory("Kế hoạch");
        setManualLink("");
        setFile(null);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Must have either file OR manual link (for new docs), or manual link/existing link for edit
        if (!editingId && !file && !manualLink) {
            alert("Vui lòng chọn tập tin hoặc nhập Link Google Drive");
            return;
        }

        setUploading(true);
        try {
            let downloadUrl = manualLink;
            let storagePath = "";
            let currentDoc = editingId ? documents.find(d => d.id === editingId) : null;

            // Use existing link if editing and no new link/file provided
            if (editingId && !file && !manualLink && currentDoc) {
                downloadUrl = currentDoc.driveLink;
                storagePath = currentDoc.storagePath || "";
            }

            if (file) {
                const storageRef = ref(storage, `documents/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                downloadUrl = await getDownloadURL(snapshot.ref);
                storagePath = snapshot.ref.fullPath;
            }

            if (editingId) {
                // UPDATE existing document
                await updateDoc(doc(db, "documents", editingId), {
                    title,
                    category,
                    driveLink: downloadUrl,
                    storagePath: storagePath || (currentDoc?.storagePath ?? ""),
                    // Date is NOT updated to preserve original upload time
                });
                alert("Đã cập nhật văn bản thành công!");
            } else {
                // CREATE new document
                // Find highest existing order to append to top (highest order is first)
                let highestOrder = 0;
                if (documents.length > 0) {
                    const orders = documents.map(d => typeof d.order === 'number' ? d.order : 0);
                    highestOrder = Math.max(...orders);
                }

                await addDoc(collection(db, "documents"), {
                    title,
                    category,
                    driveLink: downloadUrl,
                    storagePath: storagePath,
                    date: new Date().toISOString(),
                    order: highestOrder + 1, // Put at top
                });
                alert("Đã thêm văn bản thành công!");
            }

            // Reset form
            handleCancelEdit();
            fetchDocuments();
        } catch (error) {
            console.error("Error saving document:", error);
            alert("Lỗi khi lưu văn bản");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa văn bản này không? (Hành động này chỉ xóa trên web, không xóa file trong Drive)")) {
            try {
                await deleteDoc(doc(db, "documents", id));
                setDocuments(documents.filter((d) => d.id !== id));
            } catch (error) {
                console.error("Error deleting document:", error);
            }
        }
    };

    const moveDocument = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === documents.length - 1)
        ) {
            return;
        }

        const currentDoc = documents[index];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const targetDoc = documents[targetIndex];

        // If items don't have an order field yet, give them derived order based on their array position
        // The array is sorted descending, so index 0 has highest implicit order
        const totalItems = documents.length;
        const currentOrder = typeof currentDoc.order === 'number' ? currentDoc.order : totalItems - index;
        const targetOrder = typeof targetDoc.order === 'number' ? targetDoc.order : totalItems - targetIndex;

        try {
            // Optimistically update UI
            const newDocs = [...documents];
            newDocs[index] = { ...currentDoc, order: targetOrder };
            newDocs[targetIndex] = { ...targetDoc, order: currentOrder };

            // Re-sort the array based on the new orders to ensure UI reflects correctly before full fetch
            newDocs.sort((a, b) => {
                const orderA = typeof a.order === 'number' ? a.order : 0;
                const orderB = typeof b.order === 'number' ? b.order : 0;
                if (orderA !== orderB) return orderB - orderA; // Descending
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            setDocuments(newDocs);

            // Update Firestore concurrently
            await Promise.all([
                updateDoc(doc(db, "documents", currentDoc.id), { order: targetOrder }),
                updateDoc(doc(db, "documents", targetDoc.id), { order: currentOrder })
            ]);

            // Optional: fetch again to guarantee consistency
            // fetchDocuments(); 
        } catch (error) {
            console.error("Error moving document:", error);
            alert("Đã xảy ra lỗi khi thay đổi thứ tự.");
            fetchDocuments(); // Revert UI on failure
        }
    };

    if (loading) return <div>Đang tải văn bản...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản Lý Văn Bản</h1>

            <div className={`bg-white p-6 rounded-lg shadow mb-8 ${editingId ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{editingId ? "Chỉnh Sửa Văn Bản" : "Tải Lên Văn Bản Mới"}</h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-sm text-gray-500 hover:text-gray-700">
                            Hủy bỏ
                        </button>
                    )}
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                        >
                            <option value="Văn bản cấp trên">Văn bản cấp trên</option>
                            <option value="Quyết định">Quyết định</option>
                            <option value="Báo cáo">Báo cáo</option>
                            <option value="Kế hoạch">Kế hoạch</option>
                            <option value="Biểu mẫu">Biểu mẫu</option>
                            <option value="Thông báo">Thông báo</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link Google Drive (Tùy chọn)</label>
                        <input
                            type="url"
                            value={manualLink}
                            onChange={(e) => setManualLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">Dán link chia sẻ (Anyone with the link) vào đây.</p>
                    </div>

                    <div className="text-center text-sm text-gray-400 font-bold">- HOẶC -</div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tải tệp lên {editingId ? "(Chọn nếu muốn thay đổi file)" : "(Tùy chọn)"}</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-sm text-gray-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`px-4 py-2 rounded text-white flex-1 hover:brightness-110 disabled:opacity-50 ${editingId ? 'bg-green-600' : 'bg-blue-600'}`}
                        >
                            {uploading ? "Đang Xử Lý..." : (editingId ? "Cập Nhật Văn Bản" : "Lưu Văn Bản")}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={uploading}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map((doc) => (
                                <tr key={doc.id} className={editingId === doc.id ? "bg-blue-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{doc.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a href={doc.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                                            Xem
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(doc.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                                        <div className="flex flex-col gap-1 mr-2 border-r pr-3 border-gray-200">
                                            <button
                                                onClick={() => moveDocument(documents.findIndex(d => d.id === doc.id), 'up')}
                                                disabled={documents.findIndex(d => d.id === doc.id) === 0}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                                title="Đẩy lên"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => moveDocument(documents.findIndex(d => d.id === doc.id), 'down')}
                                                disabled={documents.findIndex(d => d.id === doc.id) === documents.length - 1}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                                title="Đẩy xuống"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleEdit(doc)} className="text-indigo-600 hover:text-indigo-900">
                                                Sửa
                                            </button>
                                            <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900">
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
