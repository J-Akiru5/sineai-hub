import React from 'react';
import { Link } from '@inertiajs/react';
import { FileText, Play, MessageCircle, Sparkles } from 'lucide-react';

export default function CoreFeatures() {
    return (
        <section id="features" className="py-20 bg-slate-950 text-amber-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-amber-100">Studio Showcase</h2>
                    <p className="mt-4 text-amber-200/70 max-w-2xl mx-auto">
                        Powerful tools built for filmmakers. From AI-powered scriptwriting to community collaboration.
                    </p>
                </div>

                {/* Product Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Large Left Card - Scriptwriter */}
                    <div 
                        data-aos="fade-up" 
                        data-aos-delay="0" 
                        className="row-span-2 group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href={route('login')} className="block h-full">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 overflow-hidden relative">
                                {/* Decorative gradient */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-amber-100">AI-Powered Screenwriting</h3>
                                            <p className="text-xs text-amber-500 font-medium">SCRIPTWRITER</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-amber-200/70 mb-6">
                                        Professional screenplay formatting with AI assistance. Let Spark help you craft compelling narratives.
                                    </p>
                                    
                                    {/* CSS Mock of Scriptwriter Interface */}
                                    <div className="bg-white rounded-lg shadow-2xl p-4 transform group-hover:translate-y-[-4px] transition-transform duration-300">
                                        <div className="flex items-center gap-2 mb-3 border-b border-zinc-200 pb-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            <span className="ml-2 text-xs text-zinc-500 font-mono">Untitled Script</span>
                                        </div>
                                        <div className="font-mono text-zinc-900 text-sm space-y-2">
                                            <p className="font-bold uppercase text-xs">INT. COFFEE SHOP - DAY</p>
                                            <p className="text-xs">The room is silent. MARIA enters, looking around nervously.</p>
                                            <p className="text-center uppercase font-semibold text-xs mt-3">MARIA</p>
                                            <p className="text-center text-xs italic">(whispering)</p>
                                            <p className="text-center text-xs">Is anyone here?</p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs text-amber-600 font-medium">Spark AI Ready</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Right Top Card - Premiere */}
                    <div 
                        data-aos="fade-up" 
                        data-aos-delay="100" 
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href={route('premiere.index')} className="block h-full">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 overflow-hidden relative">
                                {/* Decorative gradient */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Play className="w-5 h-5 text-white" fill="currentColor" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-100">Theater Mode</h3>
                                            <p className="text-xs text-blue-400 font-medium">PREMIERE</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-amber-200/70 text-sm mb-4">
                                        Showcase your films in a cinematic viewing experience with chapters, comments, and analytics.
                                    </p>
                                    
                                    {/* Video Player Thumbnail Mock */}
                                    <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden group-hover:translate-y-[-2px] transition-transform duration-300">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                                                <span className="text-xs text-white font-medium">Now Showing</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Right Bottom Card - Collaboration */}
                    <div 
                        data-aos="fade-up" 
                        data-aos-delay="200" 
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                        <Link href={route('login')} className="block h-full">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 overflow-hidden relative">
                                {/* Decorative gradient */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-100">Discord-style Community</h3>
                                            <p className="text-xs text-purple-400 font-medium">COLLABORATION</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-amber-200/70 text-sm mb-4">
                                        Real-time chat rooms, share scripts, and collaborate with fellow filmmakers.
                                    </p>
                                    
                                    {/* Chat Bubble UI Mock */}
                                    <div className="space-y-2 group-hover:translate-y-[-2px] transition-transform duration-300">
                                        <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0"></div>
                                            <div className="bg-slate-800 rounded-lg rounded-tl-none px-3 py-2 max-w-[80%]">
                                                <p className="text-xs text-white">Anyone want to collaborate on a short film?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 justify-end">
                                            <div className="bg-amber-500/20 rounded-lg rounded-tr-none px-3 py-2 max-w-[80%]">
                                                <p className="text-xs text-amber-100">I'm in! Let's brainstorm 🎬</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0"></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span>12 members online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
