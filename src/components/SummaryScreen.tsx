
import React, { useState } from 'react';
import type { UserProgress } from '../types';
import Button from './Button';
import Spinner from './Spinner';
import { generatePdfReport } from '../services/pdfGenerator';
import GlassCard from './GlassCard';

interface SummaryScreenProps {
    progress: UserProgress | null;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ progress }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!progress) return;
        setIsGenerating(true);
        try {
            await generatePdfReport(progress);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, revisa la consola.");
        }
        setIsGenerating(false);
    };

    if (!progress) {
        return (
            <div className="text-center p-4">
                <h2 className="text-2xl font-bold text-red-500">Error</h2>
                <p>No se encontró progreso para mostrar.</p>
            </div>
        );
    }
    
    const density = progress.labData.apparentDensity.toFixed(2);

    return (
        <div className="text-center p-4">
            <img src={progress.avatar} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]"/>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">¡Actividad Completada, {progress.name}!</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
                Has finalizado con éxito el módulo de determinación de densidad.
            </p>

            <GlassCard className="max-w-3xl mx-auto text-left mb-8 space-y-4">
                <h2 className="text-2xl font-semibold text-fuchsia-400 mb-3 border-b border-white/10 pb-2">Resumen de tu Trabajo</h2>
                <div>
                    <h3 className="font-bold text-slate-100">Resultados Clave</h3>
                    <p className="text-slate-300">Calculaste una densidad aparente de <span className="font-bold text-white">{density} g/cm³</span> para la muestra <span className="font-bold text-white">{progress.labelInfo.sampleId}</span>.</p>
                </div>
                <div>
                    <h3 className="font-bold text-slate-100">Análisis y Práctica de Laboratorio</h3>
                    <ul className="text-slate-300 list-disc list-inside space-y-1 mt-2">
                        <li>Identificaste <span className="font-semibold text-white">{progress.mineralIdentification}</span> como la muestra probable.</li>
                        <li>Tu justificación fue: <span className="italic">"{progress.conclusionJustification}"</span></li>
                        <li>Respondiste a la pregunta de seguridad {progress.safetyCheck.correct ? <span className="text-emerald-400 font-bold">correctamente</span> : <span className="text-red-400 font-bold">incorrectamente</span>}.</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-slate-100">Tu Procedimiento Propuesto</h3>
                    <p className="text-slate-300 bg-black/20 p-3 rounded-lg border border-white/10 italic">"{progress.proposedProcedure}"</p>
                </div>
                <div>
                    <h3 className="font-bold text-slate-100">Resumen del Informe Generado por IA</h3>
                    <p className="text-slate-300 bg-black/20 p-3 rounded-lg border border-white/10">{progress.labReport}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-slate-100">Habilidades Desarrolladas</h3>
                    <p className="text-slate-300">🎨 <span className="font-semibold text-white">Creatividad:</span> Al idear tu propio método y resolver problemas de cálculo e identificación.</p>
                    <p className="text-slate-300">💬 <span className="font-semibold text-white">Comunicación:</span> Al articular tu procedimiento, justificar tu conclusión y generar un resumen profesional.</p>
                </div>
            </GlassCard>

            <Button onClick={handleDownload} size="lg" variant="secondary" disabled={isGenerating}>
                 {isGenerating ? <Spinner/> : "Descargar Informe PDF"}
            </Button>
        </div>
    );
};

export default SummaryScreen;