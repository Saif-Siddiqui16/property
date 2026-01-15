import React from 'react';
import clsx from 'clsx';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    icon: Icon,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-sans font-medium cursor-pointer transition-all duration-200 border disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent gap-2 whitespace-nowrap select-none active:scale-[0.98]";

    const variants = {
        primary: "bg-primary-600 text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 border-transparent",
        secondary: "bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
        outline: "bg-transparent border-primary-200 text-primary-600 hover:bg-primary-50 hover:border-primary-300",
        ghost: "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 shadow-none",
        danger: "bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {Icon && <Icon size={18} className="flex items-center" />}
            {children}
        </button>
    );
};
