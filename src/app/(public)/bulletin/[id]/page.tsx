import { Metadata, ResolvingMetadata } from "next";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BulletinDetailClient from "./BulletinDetailClient";

type Props = {
    params: Promise<{ id: string }>
}

export const revalidate = 0; // Ensure fresh data for new posts

// Generate Static Params for Static Export
// generateStaticParams removed to force dynamic rendering for new posts

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

            return {
                title: post.title,
                description: post.content?.substring(0, 160) + "...",
                openGraph: {
                    title: post.title,
                    description: post.content?.substring(0, 160) + "...",
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
        title: "Chi tiết thông báo",
    };
}

export default async function BulletinDetailPage({ params }: Props) {
    const resolvedParams = await params;
    return <BulletinDetailClient id={resolvedParams.id} />;
}
