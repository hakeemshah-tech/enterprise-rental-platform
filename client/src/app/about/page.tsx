'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    Users,
    TrendingUp,
    Shield,
    Target,
    Lightbulb,
    Building2,
    Handshake,
    MapPin,
    Calendar,
    Star,
    Globe,
} from 'lucide-react';
import { COMPANY } from '@/lib/companyConfig';
import { useSettings } from '@/hooks/useSettings';
import { DynamicIcon } from '@/components/ui/IconPicker';

// ─── Chairman's Note ────────────────────────────────
const ChairmanSection: React.FC<{
    note?: string;
    stats?: {
        yearsExperience: string;
        propertiesManaged: string;
        satisfiedClients: string;
        guestRating: string;
    };
    brandName?: string;
}> = ({ note, stats, brandName }) => (
    <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                        The Visionary
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                        Chairman&apos;s Note
                    </h2>
                    <div className="mt-6 space-y-4 text-slate-300 leading-relaxed whitespace-pre-line">
                        {note || (
                            <>
                                <p>
                                    For nearly two decades, our team has been deeply rooted in the
                                    region&apos;s real estate landscape. What began as a commitment
                                    to providing exceptional property services has evolved into a
                                    vision: to become the No. 1 Real Estate service provider in the
                                    region.
                                </p>
                                <p>
                                    At {brandName || COMPANY.brandName}, we believe that every
                                    property tells a story, and every client deserves an experience
                                    that reflects professionalism, trust, and strategic insight.
                                </p>
                                <p>
                                    With {brandName || COMPANY.legalName}, we extend this legacy to
                                    the vacation rental space, ensuring that every guest and
                                    property owner receives the same level of dedication and premium
                                    service.
                                </p>
                            </>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-800/50">
                        <p className="text-white font-semibold">Chairman</p>
                        <p className="text-sm text-amber-400">
                            {brandName || COMPANY.parentEntity}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                >
                    <div
                        className="bg-gradient-to-br from-amber-500/10 to-orange-500/10
            border border-amber-500/20 rounded-3xl p-8 lg:p-10 backdrop-blur-sm"
                    >
                        <div className="space-y-6">
                            {[
                                {
                                    icon: Globe,
                                    value: stats?.yearsExperience || COMPANY.expertiseYears,
                                    label: 'Years of Regional Expertise',
                                },
                                {
                                    icon: Building2,
                                    value: stats?.propertiesManaged || '100+',
                                    label: 'Properties Managed',
                                },
                                {
                                    icon: Users,
                                    value: stats?.satisfiedClients || '50+',
                                    label: 'Satisfied Clients',
                                },
                                {
                                    icon: Star,
                                    value: stats?.guestRating || '4.8',
                                    label: 'Average Guest Rating',
                                },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20
                    flex items-center justify-center flex-shrink-0"
                                    >
                                        <stat.icon className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-slate-400">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

// ─── Company Timeline ────────────────────────────────
const TimelineSection: React.FC<{ brandName?: string }> = ({ brandName }) => {
    const companyName = brandName || COMPANY.parentEntity;
    const milestones = [
        {
            year: '2005+',
            title: 'Regional Roots',
            desc: 'Our founding team begins building nearly two decades of real estate expertise across the UAE.',
        },
        {
            year: String(COMPANY.established),
            title: `${companyName} Established`,
            desc: `${companyName} was officially established in ${COMPANY.headquarters.city}.`,
        },
        {
            year: '2023',
            title: 'Major Project Management',
            desc: `Grew to manage flagship projects like ${COMPANY.keyProjects.join(' and ')}.`,
        },
        {
            year: '2024',
            title: 'Vacation Homes Rental Launch',
            desc: `Launched ${brandName || COMPANY.legalName} for the holiday home market.`,
        },
        {
            year: '2025',
            title: 'Strategic Expansion',
            desc: `Expanded partnerships with ${COMPANY.partners.slice(0, 2).join(', ')}, and others.`,
        },
    ];

    return (
        <section className="py-20 bg-slate-950/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                        Our Journey
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                        Company History
                    </h2>
                    <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
                        From humble beginnings to managing major projects: our story of growth,
                        trust, and excellence.
                    </p>
                </motion.div>
                <div className="relative">
                    <div className="absolute left-4 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />
                    <div className="space-y-12">
                        {milestones.map((item, i) => (
                            <motion.div
                                key={item.year}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`relative flex flex-col sm:flex-row items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row-reverse sm:text-right' : ''}`}
                            >
                                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-500 border-4 border-slate-950 z-10" />
                                <div className="flex-1 ml-10 sm:ml-0 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
                                    <span className="text-amber-400 text-sm font-bold">
                                        {item.year}
                                    </span>
                                    <h3 className="text-white font-semibold mt-1">{item.title}</h3>
                                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                                <div className="hidden sm:block flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// ─── Core Values ─────────────────────────────────────
const ValuesSection: React.FC = () => {
    const values = [
        {
            icon: Award,
            title: 'Professionalism',
            desc: 'We uphold the highest standards in every interaction.',
        },
        {
            icon: TrendingUp,
            title: 'Efficiency',
            desc: 'Streamlined processes from listing to check-out.',
        },
        {
            icon: Lightbulb,
            title: 'Strategic Insight',
            desc: 'Data-driven analysis to maximize returns.',
        },
        { icon: Shield, title: 'Trust & Integrity', desc: 'Transparency in every transaction.' },
        {
            icon: Target,
            title: 'Customer Satisfaction',
            desc: 'High maintenance standards and responsive support.',
        },
        {
            icon: Users,
            title: 'Multinational Team',
            desc: 'Diverse expertise serving every background.',
        },
    ];

    return (
        <section className="py-20 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                        What Drives Us
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                        Our Core Values
                    </h2>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {values.map((v, i) => (
                        <motion.div
                            key={v.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-500 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
                                <v.icon className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg">{v.title}</h3>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── Services ────────────────────────────────────────
const ServicesSection: React.FC<{ services?: { name: string; icon?: string }[] }> = ({
    services,
}) => {
    const defaultServices = COMPANY.coreServices.map((name, i) => ({
        name,
        icon: ['Building2', 'TrendingUp', 'MapPin', 'Lightbulb', 'Target'][i] || 'Building2',
    }));
    const serviceList = services?.length ? services : defaultServices;

    return (
        <section className="py-20 bg-slate-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                        What We Do
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">Our Services</h2>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {serviceList.map((service, i) => (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex gap-5 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <DynamicIcon
                                    name={service.icon}
                                    className="w-5 h-5 text-amber-400"
                                    fallback={<Building2 className="w-5 h-5 text-amber-400" />}
                                />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">{service.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── Partners ────────────────────────────────────────
const PartnersSection: React.FC<{
    partnerList?: { name: string; logoUrl?: string; icon?: string }[];
}> = ({ partnerList }) => {
    const partners = partnerList?.length
        ? partnerList
        : COMPANY.partners.map((name) => ({ name, logoUrl: '', icon: '' }));

    return (
        <section className="py-20 bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                        Trusted Alliances
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">Our Partners</h2>
                    <p className="text-slate-400 mt-4 max-w-xl mx-auto">
                        We are proud to be associated with some of the most respected names in the
                        UAE real estate industry.
                    </p>
                </motion.div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {partners.map((p, i) => (
                        <motion.div
                            key={p.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-amber-500/30 hover:bg-slate-900/70 transition-all duration-300"
                        >
                            {p.logoUrl ? (
                                <img
                                    src={p.logoUrl}
                                    alt={p.name}
                                    className="max-h-12 max-w-full object-contain mb-3"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 flex items-center justify-center mb-3">
                                    <DynamicIcon
                                        name={p.icon}
                                        className="w-6 h-6 text-amber-400"
                                        fallback={<Handshake className="w-6 h-6 text-amber-400" />}
                                    />
                                </div>
                            )}
                            <p className="text-white font-semibold text-sm">{p.name}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── About Page ──────────────────────────────────────
export default function AboutPage() {
    const { settings } = useSettings();

    return (
        <>
            {/* Hero Banner */}
            <section className="relative py-28 bg-slate-950">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
                            <Calendar className="w-3.5 h-3.5" /> Established {COMPANY.established} ·{' '}
                            {COMPANY.headquarters.area}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            About{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                {settings?.companyInfo?.companyName || COMPANY.brandName}
                            </span>
                        </h1>
                        <p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            {settings?.aboutContent?.philosophy || COMPANY.philosophy}
                        </p>
                    </motion.div>
                </div>
            </section>

            <ChairmanSection
                note={settings?.chairmansNote}
                stats={settings?.companyStats}
                brandName={settings?.companyInfo?.companyName}
            />
            <TimelineSection brandName={settings?.companyInfo?.companyName} />
            <ValuesSection />
            <ServicesSection services={settings?.aboutContent?.coreServices} />
            <PartnersSection partnerList={settings?.partners} />
        </>
    );
}
