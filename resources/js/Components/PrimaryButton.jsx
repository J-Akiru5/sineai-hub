export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm text-white shadow-lg shadow-sineai-red-900/30 bg-gradient-to-r from-sineai-red-700 to-sineai-red-600 transition ease-in-out duration-150 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
