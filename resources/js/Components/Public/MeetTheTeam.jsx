import React from 'react';
import { usePage } from '@inertiajs/react';

// Fallback data if no team members in database yet
const fallbackExecutives = [
    { id: 'ex1', name: 'Jeff Martinez', position: 'President', avatar_url: '/images/team/jeff.png' },
    { id: 'ex2', name: 'Diether Jaye Catolin', position: 'Vice President', avatar_url: '/images/team/diether.png' },
    { id: 'ex3', name: 'Xavier Jess Villanis', position: 'Secretary', avatar_url: '/images/team/xavier.png' },
];

const fallbackDirectors = [
    { id: 'dir1', name: 'Kate Fernandez', position: 'Director of Communications', avatar_url: '/images/team/kate.png' },
    { id: 'dir2', name: 'Alisha Barcenal', position: 'Director of Programs', avatar_url: '/images/team/alisha.png' },
    { id: 'dir3', name: 'Krystal Laura Sangacena', position: 'Director of Creative Development', avatar_url: '/images/team/krystal.png' },
    { id: 'dir4', name: 'Romer Jhon Falalimpa', position: 'Director of Cultural Heritage', avatar_url: '/images/team/romer.png' },
    { id: 'dir5', name: 'Ariane Pearl Gegawin', position: 'Director of External Affairs', avatar_url: '/images/team/ariane.png' },
    { id: 'dir6', name: 'Christian Chavez', position: 'Director of Technology and Innovations', avatar_url: '/images/team/christian.png' },
];

// Executive positions (in order)
const executivePositions = ['president', 'vice president', 'secretary'];

export default function MeetTheTeam() {
    const { teamMembers = [] } = usePage().props;

    // Separate team members into executives and directors based on position
    const executives = teamMembers.filter(m =>
        m.position && executivePositions.some(p => m.position.toLowerCase().includes(p))
    ).sort((a, b) => {
        const aIdx = executivePositions.findIndex(p => a.position?.toLowerCase().includes(p));
        const bIdx = executivePositions.findIndex(p => b.position?.toLowerCase().includes(p));
        return aIdx - bIdx;
    });

    const directors = teamMembers.filter(m =>
        m.position && m.position.toLowerCase().includes('director')
    );

    // Use fallback data if no team members configured
    const displayExecutives = executives.length > 0 ? executives : fallbackExecutives;
    const displayDirectors = directors.length > 0 ? directors : fallbackDirectors;

    // Helper to get image URL
    const getImageUrl = (member) => {
        if (member.avatar_url) {
            // Handle both absolute URLs and relative paths
            if (member.avatar_url.startsWith('http')) return member.avatar_url;
            return member.avatar_url.startsWith('/') ? member.avatar_url : '/' + member.avatar_url;
        }
        // Default placeholder
        return '/images/default-avatar.png';
    };

    return (
        <section id="team" className="py-20 bg-slate-950 text-amber-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-bold text-amber-100">Our Leadership</h2>
                    <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-amber-200/70 max-w-2xl mx-auto">
                        Meet the visionaries guiding the SineAI Guild towards a new era of AI-powered filmmaking.
                    </p>
                </div>

                {/* Executive Officers */}
                <div className="mt-8">
                    <h3 className="text-xl font-medium text-amber-200/90 mb-6 text-center">Executive Officers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayExecutives.map((p, idx) => (
                            <div 
                                key={p.id || p.name} 
                                data-aos="fade-up" 
                                data-aos-delay={idx * 100} 
                                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
                            >
                                <div className="w-full h-48 bg-slate-800/30 rounded-xl overflow-hidden border border-white/5 mb-4 group-hover:border-amber-500/20 transition-colors">
                                    <img 
                                        src={getImageUrl(p)} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                                    />
                                </div>
                                <h4 className="text-lg font-semibold text-amber-100 group-hover:text-amber-400 transition-colors">{p.name}</h4>
                                <p className="mt-1 text-sm text-amber-200/70">{p.position || p.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Directors */}
                {displayDirectors.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-xl font-medium text-amber-200/90 mb-6 text-center">Directors</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayDirectors.map((p, idx) => (
                                <div 
                                    key={p.id || p.name}
                                    data-aos="fade-up"
                                    data-aos-delay={idx * 80}
                                    className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="w-full h-48 bg-slate-800/30 rounded-xl overflow-hidden border border-white/5 mb-4 group-hover:border-amber-500/20 transition-colors">
                                        <img 
                                            src={getImageUrl(p)}
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                                        />
                                    </div>
                                    <h4 className="text-lg font-semibold text-amber-100 group-hover:text-amber-400 transition-colors">{p.name}</h4>
                                    <p className="mt-1 text-sm text-amber-200/70">{p.position || p.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
