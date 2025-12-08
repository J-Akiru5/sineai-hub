import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <div className="flex flex-col items-start w-full">
            <input
                {...props}
                type={type}
                className={
                    'w-full bg-slate-900/40 backdrop-blur-sm border border-white/10 text-white placeholder:text-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30 ' +
                    className
                }
                ref={input}
            />
        </div>
    );
});
