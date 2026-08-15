import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://webbanngo.vercel.app';

    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/bulletin`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/documents`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/resources`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/lookup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // Fetch dynamic news posts from Firestore
    try {
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const dynamicRoutes: MetadataRoute.Sitemap = postsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                url: `${baseUrl}/news/${doc.id}`,
                lastModified: data.updatedAt ? new Date(data.updatedAt) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            };
        });

        return [...staticRoutes, ...dynamicRoutes];
    } catch (error) {
        console.error('Error generating sitemap posts:', error);
        return staticRoutes;
    }
}
