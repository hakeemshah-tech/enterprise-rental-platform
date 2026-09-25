'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    // Build BreadcrumbList JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: item.href } : {}),
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 flex-wrap"
            >
                {items.map((item, i) => (
                    <React.Fragment key={i}>
                        {i === 0 && <Home className="w-3.5 h-3.5 text-slate-500 mr-0.5" />}
                        {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                        {item.href && i < items.length - 1 ? (
                            <Link
                                href={item.href}
                                className="hover:text-amber-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className={
                                    i === items.length - 1
                                        ? 'text-slate-200 font-medium truncate max-w-[200px]'
                                        : ''
                                }
                            >
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </nav>
        </>
    );
};

export default Breadcrumbs;
