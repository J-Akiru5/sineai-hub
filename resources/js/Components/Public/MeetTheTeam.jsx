import React from 'react';

const executives = [
    { name: 'Jeff Martinez', title: 'President', img: '/images/team/jeff-martinez.jpg' },
    { name: 'Diether Jaye Catolin', title: 'Vice President', img: '/images/team/diether-jaye-catolin.jpg' },
    { name: 'Xavier Jess Villanis', title: 'Secretary', img: '/images/team/xavier-jess-villanis.jpg' },
];

const directors = [
    { name: 'Kate Fernandez', title: 'Director of Communications', img: '/images/team/kate-fernandez.jpg' },
    { name: 'Alisha Barcenal', title: 'Director of Programs', img: '/images/team/alisha-barcenal.jpg' },
    { name: 'Krystal Laura Sangacena', title: 'Director of Creative Development', img: '/images/team/krystal-laura-sangacena.jpg' },
    { name: 'Romer Jhon Falalimpa', title: 'Director of Cultural Heritage', img: '/images/team/romer-jhon-falalimpa.jpg' },
    { name: 'Ariane Pearl Gegawin', title: 'Director of External Affairs', img: '/images/team/ariane-pearl-gegawin.jpg' },
    { name: 'Christian Chavez', title: 'Director of Technology and Innovations', img: '/images/team/christian-chavez.jpg' },
];

export default function MeetTheTeam() {
    return (
        <section id="team" className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Our Leadership</h2>

                {/* Executive Officers */}
                <div className="mt-8">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">Executive Officers</h3>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {executives.map((p, idx) => (
                            <div key={p.name} data-aos="fade-up" data-aos-delay={idx * 100} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm text-center">
                                {/* replace src with real photo paths later */}
                                <div className="w-full h-44 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{p.name}</h4>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{p.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Directors */}
                <div className="mt-12">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">Directors</h3>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {directors.map((p, idx) => (
                            <div key={p.name} data-aos="fade-up" data-aos-delay={idx * 80} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm text-center">
                                <div className="w-full h-44 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{p.name}</h4>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{p.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
