
import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
    const classes = `bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8 ${className}`;
    
    return (
        <div className={classes}>
            {children}
        </div>
    );
};

export default GlassCard;