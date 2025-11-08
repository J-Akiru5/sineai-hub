import { usePage } from '@inertiajs/react';

export default function useTranslations() {
    const { props } = usePage();
    const translations = props.translations ?? {};

    const __ = (key) => {
        return translations[key] ?? key;
    };

    return { __ };
}
