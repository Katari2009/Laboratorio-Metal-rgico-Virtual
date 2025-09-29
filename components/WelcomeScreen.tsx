import React, { useState } from 'react';
import Button from './Button';
import GlassCard from './GlassCard';

interface WelcomeScreenProps {
    onStart: (userData: { name: string; course: string; avatar: string }) => void;
}

const AVATARS = [
    'https://picsum.photos/seed/avatar1/100',
    'https://picsum.photos/seed/avatar2/100',
    'https://picsum.photos/seed/avatar3/100',
    'https://picsum.photos/seed/avatar4/100',
    'https://picsum.photos/seed/avatar5/100',
    'https://picsum.photos/seed/avatar6/100',
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    const [name, setName] = useState('');
    const [course, setCourse] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [error, setError] = useState('');
    
    const handleStartClick = () => {
        if (!name.trim() || !course.trim() || !selectedAvatar) {
            setError('Por favor, completa todos los campos y selecciona un avatar.');
            return;
        }
        setError('');
        onStart({ name, course, avatar: selectedAvatar });
    };

    return (
        <div className="text-center p-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">Laboratorio Metalúrgico Virtual</h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
                Bienvenido/a al módulo sobre "Densidad de Muestras de Mena Mineral".
            </p>
            
            <GlassCard className="max-w-2xl mx-auto text-left">
                <h2 className="text-2xl font-semibold text-fuchsia-400 mb-6 text-center">Registro del Estudiante</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ej: Valentina Rojas"
                        />
                    </div>
                     <div>
                        <label htmlFor="course" className="block text-sm font-medium text-slate-300 mb-1">Curso</label>
                        <input
                            id="course"
                            type="text"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ej: 3° C TP"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Elige tu Avatar</label>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {AVATARS.map((avatarUrl) => (
                                <img
                                    key={avatarUrl}
                                    src={avatarUrl}
                                    alt="Avatar"
                                    onClick={() => setSelectedAvatar(avatarUrl)}
                                    className={`w-16 h-16 rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110 ${selectedAvatar === avatarUrl ? 'ring-4 ring-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'ring-2 ring-slate-600 hover:ring-slate-400'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                
                <div className="mt-8 text-center">
                    <Button onClick={handleStartClick} size="lg">
                        ¡Comenzar Actividad!
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};

export default WelcomeScreen;