
import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const percentage = (current / total) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between mb-1 text-sm text-slate-400">
                <span>Paso {current} de {total}</span>
                <span>{Math.round(percentage)}% Completado</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
