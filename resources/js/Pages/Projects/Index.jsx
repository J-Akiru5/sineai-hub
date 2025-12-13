// resources/js/Pages/Projects/Index.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import ProjectCard from '@/Components/ProjectCard';
import useTranslations from '@/Hooks/useTranslations';

// This component receives the 'projects' and 'auth' props from the controller
export default function Index({ auth, projects }) {
  const { __ } = useTranslations();

    return (
      <AuthenticatedLayout
        auth={auth}
        header={
          <div className="flex items-center justify-between w-full">
            <h2 className="font-semibold text-xl text-amber-100 leading-tight">{__('Projects Gallery')}</h2>
            <Link href={route('projects.create')} className="inline-block px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 rounded-lg font-semibold shadow-md">+ New Project</Link>
          </div>
        }
      >
            <Head title="Projects" />

        <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">



            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 text-amber-100">
                {(!projects || projects.length === 0) ? (
                  <div className="text-amber-200/80">{__('No projects have been uploaded yet. Be the first!')}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} auth_user_id={auth?.user?.id} />
                    ))}
                  </div>
                )}
              </div>
            </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}