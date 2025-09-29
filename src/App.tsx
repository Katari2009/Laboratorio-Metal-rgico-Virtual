
import React, { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ActivityModule from './components/ActivityModule';
import SummaryScreen from './components/SummaryScreen';
import Footer from './components/Footer';
import type { UserProgress, Screen } from './types';

const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('welcome');
    const [userProgress, setUserProgress] = useState<Partial<UserProgress> | null>(null);

    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem('userProgress');
            if (savedProgress) {
                const progress: UserProgress = JSON.parse(savedProgress);
                setUserProgress(progress);
                if (progress.completed) {
                    setScreen('summary');
                }
            }
        } catch (error) {
            console.error("Failed to load user progress:", error);
        }
    }, []);

    const handleStart = (userData: { name: string; course: string; avatar: string }) => {
        const initialProgress = {
            ...userData,
            completed: false,
        };
        setUserProgress(initialProgress);
        setScreen('activity');
    };

    const handleComplete = useCallback((progress: UserProgress) => {
        setUserProgress(progress);
        try {
            localStorage.setItem('userProgress', JSON.stringify(progress));
        } catch (error) {
            console.error("Failed to save user progress:", error);
        }
        setScreen('summary');
    }, []);

    const renderScreen = () => {
        switch (screen) {
            case 'activity':
                return <ActivityModule userProgress={userProgress!} onComplete={handleComplete} />;
            case 'summary':
                return <SummaryScreen progress={userProgress as UserProgress} />;
            case 'welcome':
            default:
                // Si el progreso existe y está completo, no mostramos Welcome, sino Summary.
                // Esta comprobación ya se hace en useEffect. Si llegamos aquí con progreso, es porque no está completo.
                // No obstante, por seguridad, si ya se ha completado, no se debería poder reiniciar.
                if (userProgress?.completed) {
                    return <SummaryScreen progress={userProgress as UserProgress} />;
                }
                return <WelcomeScreen onStart={handleStart} />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen text-slate-100 p-4 font-sans selection:bg-cyan-400/30">
            <main className="w-full max-w-5xl flex-grow flex flex-col justify-center animate-fade-in">
                {renderScreen()}
            </main>
            <Footer />
        </div>
    );
};

export default App;