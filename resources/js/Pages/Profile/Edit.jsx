import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Profile</h2>}
        >
            <Head title="Profile" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 sm:p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg max-w-4xl mx-auto space-y-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="text-amber-100"
                        />

                        <div className="border-t border-white/6 pt-4">
                            <UpdatePasswordForm className="text-amber-100" />
                        </div>

                        <div className="border-t border-white/6 pt-4">
                            <DeleteUserForm className="text-amber-100" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
