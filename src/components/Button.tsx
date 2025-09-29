
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseClasses = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center';
    
    const variantClasses = {
        primary: 'bg-cyan-500/80 border border-cyan-400/50 hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] text-white focus:ring-cyan-400',
        secondary: 'bg-fuchsia-500/80 border border-fuchsia-400/50 hover:bg-fuchsia-500 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] text-white focus:ring-fuchsia-400',
        success: 'bg-emerald-500/80 border border-emerald-400/50 hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] text-white focus:ring-emerald-400',
    };

    const sizeClasses = {
        sm: 'py-2 px-4 text-sm',
        md: 'py-2.5 px-6 text-base',
        lg: 'py-3 px-8 text-lg',
    };

    const disabledClasses = 'disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none disabled:border-transparent';

    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className,
    ].join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;