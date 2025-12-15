import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext(undefined);

export const LANGUAGES = {
    EN: 'en',
    TL: 'tl',
};

export const LANGUAGE_NAMES = {
    en: 'English',
    tl: 'Tagalog',
};

// Translation strings
const translations = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.projects': 'Projects',
        'nav.premiere': 'Premiere',
        'nav.studio': 'Studio',
        'nav.my_projects': 'My Projects',
        'nav.my_playlists': 'My Playlists',
        'nav.upload_project': 'Upload Project',
        'nav.video_editor': 'Video Editor',
        'nav.my_storage': 'My Storage',
        'nav.community': 'Community',
        'nav.ai_tools': 'AI Tools',
        'nav.spark_assistant': 'Spark Assistant',
        'nav.scriptwriter': 'Scriptwriter',
        'nav.admin': 'Admin',
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        'nav.notifications': 'Notifications',
        'nav.logout': 'Log Out',
        
        // Auth
        'auth.login': 'Log in',
        'auth.register': 'Register',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirm_password': 'Confirm Password',
        'auth.remember_me': 'Remember me',
        'auth.forgot_password': 'Forgot your password?',
        'auth.already_registered': 'Already registered?',
        'auth.new_to_sineai': 'New to SineAI?',
        'auth.create_account': 'Create an account',
        'auth.name': 'Name',
        
        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.search': 'Search',
        'common.loading': 'Loading...',
        'common.success': 'Success',
        'common.error': 'Error',
        'common.warning': 'Warning',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.view': 'View',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.submit': 'Submit',
        'common.close': 'Close',
        'common.upload': 'Upload',
        'common.download': 'Download',
        'common.all_rights_reserved': 'All rights reserved.',
        
        // Profile
        'profile.title': 'Profile Information',
        'profile.description': 'Update your account\'s profile information and public profile.',
        'profile.basic_info': 'Basic Info',
        'profile.creator_profile': 'Creator Profile',
        'profile.social_links': 'Social Links',
        'profile.avatar': 'Avatar',
        'profile.banner': 'Profile Banner',
        'profile.username': 'Username',
        'profile.bio': 'Bio',
        'profile.headline': 'Headline',
        'profile.location': 'Location',
        'profile.website': 'Website',
        'profile.pen_name': 'Pen Name',
        'profile.studio_name': 'Studio Name',
        'profile.contact_number': 'Contact Number',
        'profile.save_changes': 'Save Changes',
        
        // Settings
        'settings.title': 'Settings',
        'settings.account': 'Account',
        'settings.notifications': 'Notifications',
        'settings.privacy': 'Privacy',
        'settings.appearance': 'Appearance',
        'settings.language': 'Language',
        'settings.theme': 'Theme',
        'settings.dark_mode': 'Dark Mode',
        'settings.light_mode': 'Light Mode',
        
        // Projects
        'projects.title': 'Projects',
        'projects.create_new': 'Create New Project',
        'projects.upload_new': 'Upload New Project',
        'projects.no_projects': 'No projects have been uploaded yet. Be the first!',
        'projects.views': 'views',
        'projects.likes': 'likes',
        'projects.comments': 'comments',
        
        // Chat
        'chat.title': 'Community Chat',
        'chat.write_message': 'Write a message...',
        'chat.send': 'Send',
        'chat.sineai_community': 'SineAI Community',
        'chat.online': 'Online',
        'chat.no_users_online': 'No users online',
        'chat.status_online': 'Online',
        'chat.channel': 'channel',
        'chat.no_messages_yet': 'No messages yet in this channel.',
        'chat.be_first_to_speak': 'Be the first to say something!',
        'chat.unknown': 'Unknown',
        'chat.announcement': 'Announcement',
        'chat.announcement_mode': 'Announcement Mode',
        'chat.announcement_highlighted': 'This message will be highlighted for everyone',
        'chat.toggle_announcement': 'Toggle Announcement Mode',
        'chat.write_announcement': 'Write an announcement...',
        'chat.message': 'Message',
        'chat.share_script': 'Share Script',
        'chat.share_project': 'Share Project',
        'chat.upload_file': 'Upload File',
        'chat.coming_soon': 'Coming soon',
        'chat.script': 'Script',
        'chat.project': 'Project',
        'chat.untitled_script': 'Untitled Script',
        'chat.untitled_project': 'Untitled Project',
        'chat.open_in_studio': 'Open in Studio',
        'chat.view_project': 'View Project',
        'chat.select_script': 'Select a Script to Share',
        'chat.select_project': 'Select a Project to Share',
        'chat.no_scripts_found': 'No scripts found',
        'chat.no_projects_found': 'No projects found',
        'chat.create_first_script': 'Create your first script',
        'chat.upload_first_project': 'Upload your first project',
        
        // Alerts
        'alert.confirm_delete': 'Are you sure you want to delete this?',
        'alert.delete_success': 'Deleted successfully!',
        'alert.save_success': 'Saved successfully!',
        'alert.update_success': 'Updated successfully!',
        'alert.error_occurred': 'An error occurred. Please try again.',
    },
    tl: {
        // Navigation
        'nav.dashboard': 'Pamamahala',
        'nav.projects': 'Mga Proyekto',
        'nav.premiere': 'Premiere',
        'nav.studio': 'Studio',
        'nav.my_projects': 'Aking Mga Proyekto',
        'nav.my_playlists': 'Aking Mga Playlist',
        'nav.upload_project': 'Mag-upload ng Proyekto',
        'nav.video_editor': 'Editor ng Video',
        'nav.my_storage': 'Aking Storage',
        'nav.community': 'Komunidad',
        'nav.ai_tools': 'Mga AI Tool',
        'nav.spark_assistant': 'Spark Assistant',
        'nav.scriptwriter': 'Scriptwriter',
        'nav.admin': 'Admin',
        'nav.profile': 'Profile',
        'nav.settings': 'Mga Setting',
        'nav.notifications': 'Mga Abiso',
        'nav.logout': 'Mag-Logout',
        
        // Auth
        'auth.login': 'Mag-login',
        'auth.register': 'Mag-register',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirm_password': 'Kumpirmahin ang Password',
        'auth.remember_me': 'Tandaan ako',
        'auth.forgot_password': 'Nakalimutan ang password?',
        'auth.already_registered': 'May account na?',
        'auth.new_to_sineai': 'Bago sa SineAI?',
        'auth.create_account': 'Gumawa ng account',
        'auth.name': 'Pangalan',
        
        // Common
        'common.save': 'I-save',
        'common.cancel': 'Kanselahin',
        'common.delete': 'Tanggalin',
        'common.edit': 'I-edit',
        'common.create': 'Gumawa',
        'common.search': 'Maghanap',
        'common.loading': 'Naglo-load...',
        'common.success': 'Tagumpay',
        'common.error': 'Error',
        'common.warning': 'Babala',
        'common.confirm': 'Kumpirmahin',
        'common.yes': 'Oo',
        'common.no': 'Hindi',
        'common.view': 'Tingnan',
        'common.back': 'Bumalik',
        'common.next': 'Susunod',
        'common.previous': 'Nakaraan',
        'common.submit': 'Isumite',
        'common.close': 'Isara',
        'common.upload': 'Mag-upload',
        'common.download': 'Mag-download',
        'common.all_rights_reserved': 'Lahat ng karapatan ay nakalaan.',
        
        // Profile
        'profile.title': 'Impormasyon ng Profile',
        'profile.description': 'I-update ang impormasyon ng iyong account at pampublikong profile.',
        'profile.basic_info': 'Pangunahing Impormasyon',
        'profile.creator_profile': 'Profile ng Creator',
        'profile.social_links': 'Mga Social Link',
        'profile.avatar': 'Avatar',
        'profile.banner': 'Profile Banner',
        'profile.username': 'Username',
        'profile.bio': 'Bio',
        'profile.headline': 'Headline',
        'profile.location': 'Lokasyon',
        'profile.website': 'Website',
        'profile.pen_name': 'Pen Name',
        'profile.studio_name': 'Pangalan ng Studio',
        'profile.contact_number': 'Contact Number',
        'profile.save_changes': 'I-save ang mga Pagbabago',
        
        // Settings
        'settings.title': 'Mga Setting',
        'settings.account': 'Account',
        'settings.notifications': 'Mga Abiso',
        'settings.privacy': 'Privacy',
        'settings.appearance': 'Hitsura',
        'settings.language': 'Wika',
        'settings.theme': 'Tema',
        'settings.dark_mode': 'Dark Mode',
        'settings.light_mode': 'Light Mode',
        
        // Projects
        'projects.title': 'Mga Proyekto',
        'projects.create_new': 'Gumawa ng Bagong Proyekto',
        'projects.upload_new': 'Mag-upload ng Bagong Proyekto',
        'projects.no_projects': 'Wala pang na-upload na proyekto. Maging una!',
        'projects.views': 'mga view',
        'projects.likes': 'mga like',
        'projects.comments': 'mga komento',
        
        // Chat
        'chat.title': 'Community Chat',
        'chat.write_message': 'Magsulat ng mensahe...',
        'chat.send': 'Ipadala',
        'chat.sineai_community': 'SineAI Komunidad',
        'chat.online': 'Online',
        'chat.no_users_online': 'Walang online na user',
        'chat.status_online': 'Online',
        'chat.channel': 'channel',
        'chat.no_messages_yet': 'Wala pang mensahe sa channel na ito.',
        'chat.be_first_to_speak': 'Maging una kang magsalita!',
        'chat.unknown': 'Hindi Kilala',
        'chat.announcement': 'Anunsyo',
        'chat.announcement_mode': 'Mode ng Anunsyo',
        'chat.announcement_highlighted': 'Ang mensaheng ito ay maha-highlight para sa lahat',
        'chat.toggle_announcement': 'I-toggle ang Mode ng Anunsyo',
        'chat.write_announcement': 'Magsulat ng anunsyo...',
        'chat.message': 'Mensahe',
        'chat.share_script': 'Ibahagi ang Script',
        'chat.share_project': 'Ibahagi ang Proyekto',
        'chat.upload_file': 'Mag-upload ng File',
        'chat.coming_soon': 'Malapit na',
        'chat.script': 'Script',
        'chat.project': 'Proyekto',
        'chat.untitled_script': 'Walang Pamagat na Script',
        'chat.untitled_project': 'Walang Pamagat na Proyekto',
        'chat.open_in_studio': 'Buksan sa Studio',
        'chat.view_project': 'Tingnan ang Proyekto',
        'chat.select_script': 'Pumili ng Script na Ibabahagi',
        'chat.select_project': 'Pumili ng Proyekto na Ibabahagi',
        'chat.no_scripts_found': 'Walang nakitang script',
        'chat.no_projects_found': 'Walang nakitang proyekto',
        'chat.create_first_script': 'Gumawa ng iyong unang script',
        'chat.upload_first_project': 'Mag-upload ng iyong unang proyekto',
        
        // Alerts
        'alert.confirm_delete': 'Sigurado ka bang gusto mong tanggalin ito?',
        'alert.delete_success': 'Matagumpay na natanggal!',
        'alert.save_success': 'Matagumpay na na-save!',
        'alert.update_success': 'Matagumpay na na-update!',
        'alert.error_occurred': 'May naganap na error. Subukan ulit.',
    },
};

export function LanguageProvider({ children, initialLocale = 'en' }) {
    const [language, setLanguage] = useState(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('language');
            if (stored && Object.values(LANGUAGES).includes(stored)) {
                return stored;
            }
        }
        return initialLocale;
    });

    useEffect(() => {
        // Store in localStorage
        localStorage.setItem('language', language);
        
        // Update the html lang attribute
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback((key, params = {}) => {
        const translation = translations[language]?.[key] || translations.en?.[key] || key;
        
        // Simple parameter replacement
        return Object.entries(params).reduce((str, [key, value]) => {
            return str.replace(new RegExp(`:${key}`, 'g'), value);
        }, translation);
    }, [language]);

    const changeLanguage = (lang) => {
        if (Object.values(LANGUAGES).includes(lang)) {
            setLanguage(lang);
        }
    };

    return (
        <LanguageContext.Provider value={{ 
            language, 
            t, 
            changeLanguage,
            languages: LANGUAGES,
            languageNames: LANGUAGE_NAMES,
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
