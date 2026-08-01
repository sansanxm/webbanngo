"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
    const [postCount, setPostCount] = useState<number | null>(null);
    const [documentCount, setDocumentCount] = useState<number | null>(null);
    const [totalVisits, setTotalVisits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const postsColl = collection(db, "posts");
                const documentsColl = collection(db, "documents");

                const postsSnapshot = await getCountFromServer(postsColl);
                const documentsSnapshot = await getCountFromServer(documentsColl);

                // Fetch total visits
                const statsRef = doc(db, "system_stats", "general");
                const statsSnap = await getDoc(statsRef);
                const visits = statsSnap.exists() ? statsSnap.data().totalVisits : 0;

                setPostCount(postsSnapshot.data().count);
                setDocumentCount(documentsSnapshot.data().count);
                setTotalVisits(visits);
            } catch (error) {
                console.error("Error fetching counts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Bảng Điều Khiển</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-blue-900/10 border-l-4 border-blue-500 border-t border-r border-b dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">Tổng Số Bài Viết</h3>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {loading ? "..." : postCount ?? 0}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-green-900/10 border-l-4 border-green-500 border-t border-r border-b dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">Tổng Số Văn Bản</h3>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {loading ? "..." : documentCount ?? 0}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-yellow-900/10 border-l-4 border-yellow-500 border-t border-r border-b dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">Lượt Truy Cập Web</h3>
                    <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                        {loading ? "..." : totalVisits?.toLocaleString() ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
}
