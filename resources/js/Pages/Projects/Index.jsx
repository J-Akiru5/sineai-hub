// resources/js/Pages/Projects/Index.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ProjectCard from '@/Components/ProjectCard';
import useTranslations from '@/Hooks/useTranslations';

// This component receives the 'projects' and 'auth' props from the controller
export default function Index({ auth, projects }) {
  const { __ } = useTranslations();

    return (
      <AuthenticatedLayout
        auth={auth}
        header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{__('Projects Gallery')}</h2>}
      >
            <Head title="Projects" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                {(!projects || projects.length === 0) ? (
                  <div className="text-gray-700">{__('No projects have been uploaded yet. Be the first!')}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
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