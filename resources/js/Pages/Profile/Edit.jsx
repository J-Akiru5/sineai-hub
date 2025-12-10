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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl text-amber-100"
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg">
                        <UpdatePasswordForm className="max-w-xl text-amber-100" />
                    </div>

                    <div className="p-4 sm:p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg">
                        <DeleteUserForm className="max-w-xl text-amber-100" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
