import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-amber-500 text-amber-200 '
                    : 'border-transparent text-white/80 hover:text-amber-200 hover:border-amber-500 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
