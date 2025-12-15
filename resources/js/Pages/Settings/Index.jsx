import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BellIcon, 
    ShieldCheckIcon, 
    PaintBrushIcon, 
    PlayIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

function SettingSection({ title, description, icon: Icon, children }) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                    <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-amber-100">{title}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>
            <div className="pt-4 border-t border-white/5">
                {children}
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange, disabled = false }) {
    return (
        <label className="flex items-center justify-between py-3 cursor-pointer group">
            <div className="flex-1 pr-4">
                <span className="text-sm font-medium text-amber-100 group-hover:text-amber-50 transition-colors">
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    ${checked ? 'bg-amber-500' : 'bg-slate-700'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </label>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <div className="py-3">
            <label className="block text-sm font-medium text-amber-100 mb-2">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default function Settings({ auth, settings }) {
    const [activeTab, setActiveTab] = useState('notifications');
    const [saved, setSaved] = useState({});

    const tabs = [
        { id: 'notifications', label: 'Notifications', icon: BellIcon },
        { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
        { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
        { id: 'player', label: 'Player', icon: PlayIcon },
        { id: 'danger', label: 'Danger Zone', icon: TrashIcon },
    ];

    // Notification settings form
    const notificationForm = useForm({
        email_notifications: settings?.email_notifications ?? true,
        push_notifications: settings?.push_notifications ?? true,
        notify_comments: settings?.notify_comments ?? true,
        notify_likes: settings?.notify_likes ?? true,
        notify_follows: settings?.notify_follows ?? true,
        notify_mentions: settings?.notify_mentions ?? true,
        notify_messages: settings?.notify_messages ?? true,
        notify_project_updates: settings?.notify_project_updates ?? true,
        digest_frequency: settings?.digest_frequency ?? 'daily',
    });

    // Privacy settings form
    const privacyForm = useForm({
        profile_visibility: settings?.profile_visibility ?? 'public',
        show_email: settings?.show_email ?? false,
        show_activity: settings?.show_activity ?? true,
        allow_messages: settings?.allow_messages ?? 'everyone',
        show_online_status: settings?.show_online_status ?? true,
    });

    // Appearance settings form
    const appearanceForm = useForm({
        theme: settings?.theme ?? 'dark',
        language: settings?.language ?? 'en',
        reduced_motion: settings?.reduced_motion ?? false,
    });

    // Player settings form
    const playerForm = useForm({
        autoplay: settings?.autoplay ?? true,
        default_quality: settings?.default_quality ?? 'auto',
        theater_mode: settings?.theater_mode ?? false,
        playback_speed: settings?.playback_speed ?? '1',
    });

    const handleSaveSection = (section, form) => {
        form.patch(route(`settings.${section}`), {
            preserveScroll: true,
            onSuccess: () => {
                setSaved(prev => ({ ...prev, [section]: true }));
                setTimeout(() => {
                    setSaved(prev => ({ ...prev, [section]: false }));
                }, 2000);
            },
        });
    };

    const handleExportData = () => {
        window.location.href = route('settings.export');
    };

    const deleteAccountForm = useForm({});

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteAccountForm.delete(route('settings.deleteAccount'));
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar */}
                        <div className="lg:w-64 flex-shrink-0">
                            <nav className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-2 space-y-1 sticky top-24">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                            ${activeTab === tab.id 
                                                ? 'bg-amber-500/20 text-amber-400' 
                                                : 'text-gray-400 hover:bg-white/5 hover:text-amber-100'}
                                        `}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-6">
                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <SettingSection
                                    title="Notification Preferences"
                                    description="Choose how you want to be notified about activity"
                                    icon={BellIcon}
                                >
                                    <div className="space-y-1 divide-y divide-white/5">
                                        <Toggle
                                            label="Email Notifications"
                                            description="Receive notifications via email"
                                            checked={notificationForm.data.email_notifications}
                                            onChange={(val) => notificationForm.setData('email_notifications', val)}
                                        />
                                        <Toggle
                                            label="Push Notifications"
                                            description="Receive browser push notifications"
                                            checked={notificationForm.data.push_notifications}
                                            onChange={(val) => notificationForm.setData('push_notifications', val)}
                                        />
                                        <Toggle
                                            label="Comment Notifications"
                                            description="When someone comments on your projects"
                                            checked={notificationForm.data.notify_comments}
                                            onChange={(val) => notificationForm.setData('notify_comments', val)}
                                        />
                                        <Toggle
                                            label="Like Notifications"
                                            description="When someone likes your projects"
                                            checked={notificationForm.data.notify_likes}
                                            onChange={(val) => notificationForm.setData('notify_likes', val)}
                                        />
                                        <Toggle
                                            label="Follow Notifications"
                                            description="When someone follows you"
                                            checked={notificationForm.data.notify_follows}
                                            onChange={(val) => notificationForm.setData('notify_follows', val)}
                                        />
                                        <Toggle
                                            label="Mention Notifications"
                                            description="When someone mentions you"
                                            checked={notificationForm.data.notify_mentions}
                                            onChange={(val) => notificationForm.setData('notify_mentions', val)}
                                        />
                                        <Toggle
                                            label="Message Notifications"
                                            description="When you receive a direct message"
                                            checked={notificationForm.data.notify_messages}
                                            onChange={(val) => notificationForm.setData('notify_messages', val)}
                                        />
                                        <SelectField
                                            label="Email Digest Frequency"
                                            value={notificationForm.data.digest_frequency}
                                            onChange={(val) => notificationForm.setData('digest_frequency', val)}
                                            options={[
                                                { value: 'realtime', label: 'Real-time' },
                                                { value: 'daily', label: 'Daily' },
                                                { value: 'weekly', label: 'Weekly' },
                                                { value: 'never', label: 'Never' },
                                            ]}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => handleSaveSection('notifications', notificationForm)}
                                            disabled={notificationForm.processing}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saved.notifications ? (
                                                <>
                                                    <CheckIcon className="w-4 h-4" />
                                                    Saved!
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </SettingSection>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <SettingSection
                                    title="Privacy Settings"
                                    description="Control who can see your information and activity"
                                    icon={ShieldCheckIcon}
                                >
                                    <div className="space-y-1 divide-y divide-white/5">
                                        <SelectField
                                            label="Profile Visibility"
                                            value={privacyForm.data.profile_visibility}
                                            onChange={(val) => privacyForm.setData('profile_visibility', val)}
                                            options={[
                                                { value: 'public', label: 'Public - Anyone can view your profile' },
                                                { value: 'private', label: 'Private - Only followers can view' },
                                                { value: 'hidden', label: 'Hidden - Only you can view' },
                                            ]}
                                        />
                                        <Toggle
                                            label="Show Email Address"
                                            description="Display your email on your public profile"
                                            checked={privacyForm.data.show_email}
                                            onChange={(val) => privacyForm.setData('show_email', val)}
                                        />
                                        <Toggle
                                            label="Show Activity"
                                            description="Display your recent activity on your profile"
                                            checked={privacyForm.data.show_activity}
                                            onChange={(val) => privacyForm.setData('show_activity', val)}
                                        />
                                        <SelectField
                                            label="Who Can Message You"
                                            value={privacyForm.data.allow_messages}
                                            onChange={(val) => privacyForm.setData('allow_messages', val)}
                                            options={[
                                                { value: 'everyone', label: 'Everyone' },
                                                { value: 'followers', label: 'Followers only' },
                                                { value: 'nobody', label: 'Nobody' },
                                            ]}
                                        />
                                        <Toggle
                                            label="Show Online Status"
                                            description="Let others see when you're online"
                                            checked={privacyForm.data.show_online_status}
                                            onChange={(val) => privacyForm.setData('show_online_status', val)}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => handleSaveSection('privacy', privacyForm)}
                                            disabled={privacyForm.processing}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saved.privacy ? (
                                                <>
                                                    <CheckIcon className="w-4 h-4" />
                                                    Saved!
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </SettingSection>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <SettingSection
                                    title="Appearance"
                                    description="Customize how the app looks"
                                    icon={PaintBrushIcon}
                                >
                                    <div className="space-y-1 divide-y divide-white/5">
                                        <SelectField
                                            label="Theme"
                                            value={appearanceForm.data.theme}
                                            onChange={(val) => appearanceForm.setData('theme', val)}
                                            options={[
                                                { value: 'dark', label: 'Dark' },
                                                { value: 'light', label: 'Light' },
                                                { value: 'system', label: 'System Default' },
                                            ]}
                                        />
                                        <SelectField
                                            label="Language"
                                            value={appearanceForm.data.language}
                                            onChange={(val) => appearanceForm.setData('language', val)}
                                            options={[
                                                { value: 'en', label: 'English' },
                                                { value: 'es', label: 'Español' },
                                                { value: 'fr', label: 'Français' },
                                                { value: 'de', label: 'Deutsch' },
                                                { value: 'ja', label: '日本語' },
                                                { value: 'ko', label: '한국어' },
                                                { value: 'zh', label: '中文' },
                                            ]}
                                        />
                                        <Toggle
                                            label="Reduced Motion"
                                            description="Minimize animations throughout the app"
                                            checked={appearanceForm.data.reduced_motion}
                                            onChange={(val) => appearanceForm.setData('reduced_motion', val)}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => handleSaveSection('appearance', appearanceForm)}
                                            disabled={appearanceForm.processing}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saved.appearance ? (
                                                <>
                                                    <CheckIcon className="w-4 h-4" />
                                                    Saved!
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </SettingSection>
                            )}

                            {/* Player Tab */}
                            {activeTab === 'player' && (
                                <SettingSection
                                    title="Video Player"
                                    description="Configure video playback settings"
                                    icon={PlayIcon}
                                >
                                    <div className="space-y-1 divide-y divide-white/5">
                                        <Toggle
                                            label="Autoplay"
                                            description="Automatically play videos when you visit a page"
                                            checked={playerForm.data.autoplay}
                                            onChange={(val) => playerForm.setData('autoplay', val)}
                                        />
                                        <SelectField
                                            label="Default Quality"
                                            value={playerForm.data.default_quality}
                                            onChange={(val) => playerForm.setData('default_quality', val)}
                                            options={[
                                                { value: 'auto', label: 'Auto' },
                                                { value: '2160', label: '4K (2160p)' },
                                                { value: '1080', label: 'Full HD (1080p)' },
                                                { value: '720', label: 'HD (720p)' },
                                                { value: '480', label: 'SD (480p)' },
                                                { value: '360', label: 'Low (360p)' },
                                            ]}
                                        />
                                        <Toggle
                                            label="Theater Mode Default"
                                            description="Open videos in theater mode by default"
                                            checked={playerForm.data.theater_mode}
                                            onChange={(val) => playerForm.setData('theater_mode', val)}
                                        />
                                        <SelectField
                                            label="Default Playback Speed"
                                            value={playerForm.data.playback_speed}
                                            onChange={(val) => playerForm.setData('playback_speed', val)}
                                            options={[
                                                { value: '0.25', label: '0.25x' },
                                                { value: '0.5', label: '0.5x' },
                                                { value: '0.75', label: '0.75x' },
                                                { value: '1', label: 'Normal (1x)' },
                                                { value: '1.25', label: '1.25x' },
                                                { value: '1.5', label: '1.5x' },
                                                { value: '1.75', label: '1.75x' },
                                                { value: '2', label: '2x' },
                                            ]}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => handleSaveSection('player', playerForm)}
                                            disabled={playerForm.processing}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saved.player ? (
                                                <>
                                                    <CheckIcon className="w-4 h-4" />
                                                    Saved!
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </SettingSection>
                            )}

                            {/* Danger Zone Tab */}
                            {activeTab === 'danger' && (
                                <div className="space-y-6">
                                    <SettingSection
                                        title="Export Your Data"
                                        description="Download all your data in a portable format"
                                        icon={ArrowDownTrayIcon}
                                    >
                                        <p className="text-sm text-gray-400 mb-4">
                                            Export all your data including profile information, projects, comments, and settings.
                                        </p>
                                        <button
                                            onClick={handleExportData}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-amber-100 font-medium rounded-lg transition-colors"
                                        >
                                            Download My Data
                                        </button>
                                    </SettingSection>

                                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-red-500/10">
                                                <TrashIcon className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
                                                <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-red-500/10">
                                            <p className="text-sm text-gray-400 mb-4">
                                                Once you delete your account, there is no going back. All your projects, comments, 
                                                and data will be permanently removed. Please be certain.
                                            </p>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteAccountForm.processing}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Delete My Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
