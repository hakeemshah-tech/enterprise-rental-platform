import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';
import { SEO, COMPANY, generateOrganizationSchema } from '@/lib/companyConfig';

const inter = Inter({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    metadataBase: new URL(SEO.url),
    title: SEO.siteName,
    description: SEO.description,
    keywords: SEO.keywords,
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        siteName: COMPANY.brandName,
        title: SEO.siteName,
        description: SEO.description,
        url: SEO.url,
    },
    twitter: {
        card: 'summary_large_image',
        title: SEO.siteName,
        description: SEO.description,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = generateOrganizationSchema();

    return (
        <html lang="en" className="dark">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.variable} antialiased bg-slate-950 text-slate-200`}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
