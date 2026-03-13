import { Metadata } from 'next';
import CtfDetailClient from './CtfDetailClient';
import axios from 'axios';

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const { data } = await axios.get(`${backendUrl}/api/ctf`);
        const event = data.events.find((e: any) => e.id === params.id);

        if (!event) return { title: 'Event Not Found' };

        const bannerUrl = event.bannerUrl
            ? (event.bannerUrl.startsWith('http') ? event.bannerUrl : `${frontendUrl}${event.bannerUrl}`)
            : `${frontendUrl}/logo.png`; // Fallback to logo

        return {
            title: `${event.title} | CTF Operation`,
            description: event.description,
            openGraph: {
                title: event.title,
                description: event.description,
                images: [
                    {
                        url: bannerUrl,
                        width: 1200,
                        height: 630,
                        alt: event.title,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: event.title,
                description: event.description,
                images: [bannerUrl],
            },
        };
    } catch (error) {
        return { title: 'CTF Operation' };
    }
}

export default function Page({ params }: Props) {
    return <CtfDetailClient />;
}
