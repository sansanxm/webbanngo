import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Trường PTDTBT TH&THCS Bản Ngò',
        short_name: 'TH&THCS Bản Ngò',
        description: 'Trang thông tin điện tử Trường PTDTBT TH&THCS Bản Ngò, xã Pà Vầy Sủ, tỉnh Tuyên Quang',
        start_url: '/',
        display: 'standalone',
        background_color: '#991b1b',
        theme_color: '#991b1b',
        icons: [
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
