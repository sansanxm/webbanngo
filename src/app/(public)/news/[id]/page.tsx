import { Metadata, ResolvingMetadata } from "next";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import NewsDetailClient from "./NewsDetailClient";

type Props = {
    params: Promise<{ id: string }>
}

// Generate Static Params for Static Export
export async function generateStaticParams() {
    try {
        const postsSnapshot = await getDocs(collection(db, "posts"));
        return postsSnapshot.docs.map(doc => ({
            id: doc.id,
        }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const post = docSnap.data();

            let imageUrl = post.imageUrl;
            if (imageUrl && imageUrl.includes("drive.google.com")) {
                const match = imageUrl.match(/\/d\/(.+?)\//) || imageUrl.match(/id=(.+?)(&|$)/);
                if (match) {
                    imageUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                }
            }

            const description = post.introduction || post.content?.substring(0, 160) + "...";

            return {
                title: post.title,
                description: description,
                openGraph: {
                    title: post.title,
                    description: description,
                    images: imageUrl ? [imageUrl] : [],
                    type: 'article',
                    publishedTime: post.date,
                    authors: post.author ? [post.author] : [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching metadata:", error);
    }

    return {
        title: "Chi tiết tin tức",
    };
}

export default async function NewsDetailPage({ params }: Props) {
    const resolvedParams = await params;
    return <NewsDetailClient id={resolvedParams.id} />;
}
