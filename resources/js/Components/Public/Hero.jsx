import React from 'react';
import { Link } from '@inertiajs/react';
import { Activity, FileText, Play, Users, Sparkles } from 'lucide-react';

// Icon mapping for activity types
const activityIcons = {
    script: FileText,
    premiere: Play,
    members: Users,
    system: Sparkles,
};

// Default activities as fallback
const defaultActivities = [
    { id: 'welcome', type: 'system', text: "Welcome to SineAI Hub", time: "Now" },
    { id: 'community', type: 'members', text: "Join our growing community", time: "" },
    { id: 'create', type: 'script', text: "Start creating your scripts", time: "" },
];

export default function Hero({ liveActivities = [] }) {
    // Use provided activities or fallback to defaults
    const activities = liveActivities.length > 0 ? liveActivities : defaultActivities;

    return (
        <section className="relative overflow-hidden min-h-screen">

            {/* Background cover image */}
            <img src="/images/bg-library.jpg" alt="Library background" className="absolute inset-0 w-full h-full object-cover z-0" />

            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30 z-10" aria-hidden="true" />

            <div className="absolute inset-0 z-20 flex items-center px-6">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Left Content */}
                    <div className="lg:col-span-3 text-center lg:text-left">
                        <h1 data-aos="fade-up" data-aos-delay="0" className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-widest leading-tight bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-2xl">
                            SineAI Guild of Western Visayas
                        </h1>

                        <p data-aos="fade-up" data-aos-delay="120" className="mt-4 text-amber-500/80 tracking-[0.3em] text-sm md:text-base uppercase font-bold">
                            Creating a Visayan Wave of AI in Filmmaking
                        </p>

                        <p data-aos="fade-up" data-aos-delay="220" className="mt-6 max-w-2xl text-lg text-amber-200/80 mx-auto lg:mx-0">
                            The official digital ecosystem for the pioneering community of AI-assisted filmmakers in the region. Connect, create, and showcase the future of cinema.
                        </p>

                        {/* CTAs */}
                        <div data-aos="fade-up" data-aos-delay="320" className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-bold rounded-lg shadow-lg shadow-amber-500/30 transform transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                Join the Guild
                            </Link>
                            <Link
                                href={route('login')}
                                className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-xl text-amber-200 border border-white/20 rounded-lg transform transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/10 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
                            >
                                Open Studio
                            </Link>
                        </div>
                    </div>

                    {/* Right - Live Activity Glass Card (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-2" data-aos="fade-left" data-aos-delay="400">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-amber-500" />
                                <h3 className="text-amber-100 font-semibold text-lg">Live Activity</h3>
                                <span className="ml-auto flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                            </div>
                            <div className="space-y-3">
                                {activities.map((activity) => {
                                    const Icon = activityIcons[activity.type] || FileText;
                                    return (
                                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-amber-100/90 truncate">{activity.text}</p>
                                                {activity.time && <p className="text-xs text-slate-400">{activity.time}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Live Activity below hero on smaller screens */}
            <div className="lg:hidden absolute bottom-32 left-4 right-4 z-30" data-aos="fade-up" data-aos-delay="400">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-amber-500" />
                        <h3 className="text-amber-100 font-semibold text-sm">Live Activity</h3>
                        <span className="ml-auto flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    </div>
                    {activities[0] && (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                            {(() => {
                                const Icon = activityIcons[activities[0].type] || FileText;
                                return <Icon className="w-4 h-4 text-amber-500" />;
                            })()}
                            <p className="text-xs text-amber-100/90 truncate">{activities[0].text}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Spark character - two placements for responsive behavior.
                Ensure the spark sits above other layers using Tailwind's z-index classes. */}
            <img src="/images/spark.gif" alt="Spark character" className="hidden md:block absolute bottom-12 right-16 z-50 h-[35vh] w-auto pointer-events-none animate-[bounce_6s_infinite]" />

            {/* Mobile: bottom-center (overlaps glass UI slightly) */}
            <img src="/images/spark.gif" alt="Spark character" className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 h-[20vh] w-auto pointer-events-none animate-[bounce_6s_infinite]" />

        </section>
    );
}
