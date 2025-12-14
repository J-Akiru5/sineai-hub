import React from 'react';

const executives = [
    { name: 'Jeff Martinez', title: 'President', img: 'images/team/jeff.png' },
    { name: 'Diether Jaye Catolin', title: 'Vice President', img: 'images/team/diether.png' },
    { name: 'Xavier Jess Villanis', title: 'Secretary', img: 'images/team/xavier.png' },
];

const directors = [
    { name: 'Kate Fernandez', title: 'Director of Communications', img: 'images/team/kate.png' },
    { name: 'Alisha Barcenal', title: 'Director of Programs', img: 'images/team/alisha.png' },
    { name: 'Krystal Laura Sangacena', title: 'Director of Creative Development', img: 'images/team/krystal.png' },
    { name: 'Romer Jhon Falalimpa', title: 'Director of Cultural Heritage', img: 'images/team/romer.png' },
    { name: 'Ariane Pearl Gegawin', title: 'Director of External Affairs', img: 'images/team/ariane.png' },
    { name: 'Christian Chavez', title: 'Director of Technology and Innovations', img: 'images/team/christian.png' },
];

export default function MeetTheTeam() {
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
                        {executives.map((p, idx) => (
                            <div 
                                key={p.name} 
                                data-aos="fade-up" 
                                data-aos-delay={idx * 100} 
                                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
                            >
                                <div className="w-full h-48 bg-slate-800/30 rounded-xl overflow-hidden border border-white/5 mb-4 group-hover:border-amber-500/20 transition-colors">
                                    <img 
                                        src={p.img} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                </div>
                                <h4 className="text-lg font-semibold text-amber-100 group-hover:text-amber-400 transition-colors">{p.name}</h4>
                                <p className="mt-1 text-sm text-amber-200/70">{p.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Directors */}
                <div className="mt-16">
                    <h3 className="text-xl font-medium text-amber-200/90 mb-6 text-center">Directors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {directors.map((p, idx) => (
                            <div 
                                key={p.name} 
                                data-aos="fade-up" 
                                data-aos-delay={idx * 80} 
                                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
                            >
                                <div className="w-full h-48 bg-slate-800/30 rounded-xl overflow-hidden border border-white/5 mb-4 group-hover:border-amber-500/20 transition-colors">
                                    <img 
                                        src={p.img} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                </div>
                                <h4 className="text-lg font-semibold text-amber-100 group-hover:text-amber-400 transition-colors">{p.name}</h4>
                                <p className="mt-1 text-sm text-amber-200/70">{p.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
