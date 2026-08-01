import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
    console.log("Tìm các bài viết có category = 'Tin tức'...");
    const q = query(collection(db, "posts"), where("category", "==", "Tin tức"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("Không có bài viết nào bị lỗi category.");
        return;
    }

    console.log(`Tìm thấy ${snapshot.size} bài viết.`);
    for (const d of snapshot.docs) {
        console.log(`Đang sửa bài viết ID: ${d.id}`);
        await updateDoc(doc(db, "posts", d.id), {
            category: "Tin tức chung"
        });
        console.log(`Đã sửa xong!`);
    }
}

fix().catch(console.error);
