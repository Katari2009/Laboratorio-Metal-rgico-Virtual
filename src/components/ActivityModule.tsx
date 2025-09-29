
import React, { useState } from 'react';
import { evaluateProcedure, generateLabReport } from '../services/geminiService';
import type { UserProgress } from '../types';
import Button from './Button';
import GlassCard from './GlassCard';
import ProgressBar from './ProgressBar';
import Spinner from './Spinner';

interface ActivityModuleProps {
    userProgress: Partial<UserProgress>;
    onComplete: (progress: UserProgress) => void;
}

const TOTAL_STEPS = 10;

const LAB_EQUIPMENT = [
    { name: 'Balanza', required: true },
    { name: 'Probeta', required: true },
    { name: 'Agua', required: true },
    { name: 'Muestra de Mena', required: true },
    { name: 'Vaso de precipitados', required: false },
    { name: 'Matraz Erlenmeyer', required: false },
    { name: 'Termómetro', required: false },
    { name: 'Mechero Bunsen', required: false },
];

const MINERAL_DENSITIES = [
    { name: 'Cuarzo', density: '2.65 g/cm³' },
    { name: 'Calcopirita (Mena de Cobre)', density: '4.1 - 4.3 g/cm³' },
    { name: 'Hematita (Mena de Hierro)', density: '5.26 g/cm³' },
    { name: 'Galena (Mena de Plomo)', density: '7.58 g/cm³' },
];

const ActivityModule: React.FC<ActivityModuleProps> = ({ userProgress, onComplete }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<Partial<UserProgress>>({
        labData: { mass: 157.5, initialVolume: 50, finalVolume: 95, apparentDensity: 0 },
    });
    const [procedureText, setProcedureText] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [equipmentError, setEquipmentError] = useState('');
    const [safetyAnswer, setSafetyAnswer] = useState('');
    const [userDensity, setUserDensity] = useState('');
    const [densityError, setDensityError] = useState('');
    const [mineralChoice, setMineralChoice] = useState('');
    const [justification, setJustification] = useState('');
    const [requestedData, setRequestedData] = useState<string[]>([]);

    const [userLabel, setUserLabel] = useState({
        sampleId: `MN-CO-OX-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString(),
        material: 'Mena de Cobre Oxidado'
    });

    const handleEquipmentToggle = (name: string) => {
        setSelectedEquipment(prev => 
            prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
        );
    };

    const handleEquipmentSubmit = () => {
        const requiredEquipment = LAB_EQUIPMENT.filter(e => e.required).map(e => e.name);
        const allRequiredSelected = requiredEquipment.every(name => selectedEquipment.includes(name));
        
        if (!allRequiredSelected || selectedEquipment.length !== requiredEquipment.length) {
            setEquipmentError('Selección incorrecta. Revisa tu inventario. Pista: necesitas exactamente 4 elementos para medir masa y volumen por desplazamiento.');
            return;
        }
        setEquipmentError('');
        setProgress(prev => ({ ...prev, selectedEquipment }));
        setStep(2);
    };

    const handleProcedureSubmit = async () => {
        if (!procedureText.trim()) {
            alert("Por favor, describe tu procedimiento.");
            return;
        }
        setIsLoading(true);
        const feedback = await evaluateProcedure(procedureText);
        setProgress(prev => ({ ...prev, proposedProcedure: procedureText, aiFeedback: feedback }));
        setIsLoading(false);
        setStep(3);
    };

    const handleSafetySubmit = () => {
        const isCorrect = safetyAnswer === 'gafas';
        setProgress(prev => ({ ...prev, safetyCheck: { answer: safetyAnswer, correct: isCorrect } }));
        setStep(5);
    };

    const handleDataRequest = (dataKey: string) => {
        if (!requestedData.includes(dataKey)) {
            setRequestedData(prev => [...prev, dataKey]);
        }
    };

    const handleDensityCheck = () => {
        const correctDensity = (progress.labData!.mass / (progress.labData!.finalVolume - progress.labData!.initialVolume));
        const userValue = parseFloat(userDensity);
        if (isNaN(userValue) || Math.abs(userValue - correctDensity) > 0.05) {
            setDensityError(`Cálculo incorrecto. Revisa la fórmula: Densidad = Masa / Volumen. La respuesta correcta es ${correctDensity.toFixed(2)} g/cm³.`);
        } else {
            setDensityError('');
            setProgress(prev => ({ ...prev, userCalculatedDensity: userValue }));
            setStep(7);
        }
    };
    
    const handleFinalizeActivity = async () => {
        setIsLoading(true);

        const localProgress = {
            ...progress,
            mineralIdentification: mineralChoice,
            conclusionJustification: justification,
        };
        
        // --- Scoring Logic ---
        let totalScore = 0;
        const requiredEquipment = LAB_EQUIPMENT.filter(e => e.required).map(e => e.name);
        const correctEquipment = requiredEquipment.every(name => localProgress.selectedEquipment?.includes(name)) && localProgress.selectedEquipment.length === requiredEquipment.length;
        if (correctEquipment) totalScore += 10; // Step 1
        if (localProgress.proposedProcedure?.trim()) totalScore += 10; // Step 2
        if (localProgress.aiFeedback) totalScore += 5; // Step 3
        if (localProgress.safetyCheck?.correct) totalScore += 10; // Step 4
        totalScore += 5; // Step 5 (Completing data request)
        const correctDensityVal = (localProgress.labData!.mass / (localProgress.labData!.finalVolume - localProgress.labData!.initialVolume));
        if (Math.abs(localProgress.userCalculatedDensity! - correctDensityVal) < 0.05) totalScore += 15; // Step 6
        if (localProgress.mineralIdentification === 'Calcopirita (Mena de Cobre)') totalScore += 15; // Step 7
        if (localProgress.conclusionJustification?.trim()) totalScore += 10; // Step 8
        totalScore += 5; // Step 9 (Labeling)
        
        const density = localProgress.labData!.mass / (localProgress.labData!.finalVolume - localProgress.labData!.initialVolume);
        
        const finalProgressData = {
            ...userProgress,
            ...localProgress,
            labData: { ...localProgress.labData!, apparentDensity: density },
            labelInfo: userLabel,
            score: 0, // Placeholder
            completionTimestamp: new Date().toISOString(),
        };

        const report = await generateLabReport(finalProgressData);
        totalScore += 15; // Step 10 (Completing the report generation)
        
        const completedProgress = {
            ...finalProgressData,
            labReport: report,
            completed: true,
            score: totalScore,
        } as UserProgress;

        setProgress(completedProgress);
        setIsLoading(false);
        setStep(10);
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 1: Planificación del Inventario</h2>
                        <p className="mb-4 text-slate-300">Para determinar la densidad, debes planificar qué equipo es esencial. Selecciona los ítems indispensables de la lista de inventario del laboratorio.</p>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                            {LAB_EQUIPMENT.map(item => (
                                <label key={item.name} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-300 ${selectedEquipment.includes(item.name) ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <input type="checkbox" checked={selectedEquipment.includes(item.name)} onChange={() => handleEquipmentToggle(item.name)} className="w-5 h-5 mr-3 accent-cyan-400"/>
                                    <span className="font-semibold">{item.name}</span>
                                </label>
                            ))}
                        </div>
                        {equipmentError && <p className="text-red-400 text-sm mt-2 text-center">{equipmentError}</p>}
                        <div className="mt-6 text-right">
                            <Button onClick={handleEquipmentSubmit}>Confirmar Inventario</Button>
                        </div>
                    </GlassCard>
                );
            case 2:
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 2: Propón tu Procedimiento (Creatividad)</h2>
                        <p className="mb-4 text-slate-300">Con el equipo seleccionado, describe los pasos que seguirías para determinar la densidad aparente de la mena de cobre.</p>
                        <textarea
                            value={procedureText}
                            onChange={(e) => setProcedureText(e.target.value)}
                            className="w-full h-40 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ej: 1. Pesar la muestra en una balanza..."
                        />
                        <div className="mt-6 text-right">
                            <Button onClick={handleProcedureSubmit} disabled={isLoading}>
                                {isLoading ? <Spinner/> : "Enviar para Revisión IA"}
                            </Button>
                        </div>
                    </GlassCard>
                );
            case 3:
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 3: Retroalimentación de la IA (Comunicación)</h2>
                        <p className="mb-4 text-slate-300">¡Excelente! Aquí tienes la retroalimentación de nuestro asistente de IA para ayudarte a refinar tus ideas.</p>
                        <div className="bg-black/20 p-4 rounded-md border border-white/10 whitespace-pre-wrap font-mono text-sm text-slate-200">
                            {progress.aiFeedback}
                        </div>
                        <div className="mt-6 text-right">
                            <Button onClick={() => setStep(4)}>Entendido, ¡a la seguridad!</Button>
                        </div>
                    </GlassCard>
                );
            case 4:
                 const safetyOptions = ['Guantes de látex', 'Gafas de seguridad', 'Bata de laboratorio', 'Mascarilla antipolvo'];
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 4: Control de Seguridad</h2>
                        <p className="mb-4 text-slate-300">La seguridad es lo primero. En un laboratorio, ¿cuál de los siguientes elementos de protección personal (EPP) es INDISPENSABLE para casi cualquier procedimiento?</p>
                        <div className="space-y-3">
                            {safetyOptions.map(option => {
                                const value = option.split(' ')[0].toLowerCase();
                                return (
                                <label key={option} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-300 ${safetyAnswer === value ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <input type="radio" name="safety" value={value} checked={safetyAnswer === value} onChange={(e) => setSafetyAnswer(e.target.value)} className="w-5 h-5 mr-3 accent-cyan-400"/>
                                    {option}
                                </label>
                                );
                            })}
                        </div>
                        <div className="mt-6 text-right">
                            <Button onClick={handleSafetySubmit} disabled={!safetyAnswer}>Confirmar Respuesta</Button>
                        </div>
                    </GlassCard>
                );
            case 5:
                 const allDataRequested = ['mass', 'initialVolume', 'finalVolume'].every(key => requestedData.includes(key));
                 return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 5: Solicitud de Datos (Comunicación)</h2>
                        <p className="mb-6 text-slate-300">Estás en el laboratorio. Comunica a tu asistente qué mediciones necesitas para continuar. Haz clic en cada botón para obtener el dato correspondiente.</p>
                        <div className="space-y-4">
                            <div>
                                <Button variant="secondary" onClick={() => handleDataRequest('mass')} disabled={requestedData.includes('mass')}>Solicitar Medición de Masa</Button>
                                {requestedData.includes('mass') && <p className="mt-2 text-lg text-slate-200 animate-fade-in">➡️ Asistente: La masa de la muestra es <span className="font-bold text-white">{progress.labData?.mass} g</span>.</p>}
                            </div>
                             <div>
                                <Button variant="secondary" onClick={() => handleDataRequest('initialVolume')} disabled={requestedData.includes('initialVolume')}>Solicitar Volumen Inicial de Agua</Button>
                                {requestedData.includes('initialVolume') && <p className="mt-2 text-lg text-slate-200 animate-fade-in">➡️ Asistente: El volumen inicial en la probeta es <span className="font-bold text-white">{progress.labData?.initialVolume} mL</span>.</p>}
                            </div>
                             <div>
                                <Button variant="secondary" onClick={() => handleDataRequest('finalVolume')} disabled={requestedData.includes('finalVolume')}>Solicitar Volumen Final con Muestra</Button>
                                {requestedData.includes('finalVolume') && <p className="mt-2 text-lg text-slate-200 animate-fade-in">➡️ Asistente: El volumen final con la muestra sumergida es <span className="font-bold text-white">{progress.labData?.finalVolume} mL</span>.</p>}
                            </div>
                        </div>
                        <div className="mt-8 text-right">
                            <Button onClick={() => setStep(6)} disabled={!allDataRequested}>Calcular Densidad</Button>
                        </div>
                    </GlassCard>
                );
            case 6:
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 6: Calcula la Densidad</h2>
                        <p className="mb-4 text-slate-300">Con los datos obtenidos (Masa = {progress.labData?.mass}g, Volumen desplazado = {progress.labData!.finalVolume - progress.labData!.initialVolume}mL), calcula la densidad aparente.</p>
                        <p className="mb-4 text-slate-400 text-sm">Fórmula: Densidad = Masa / Volumen</p>
                        <input
                            type="number"
                            value={userDensity}
                            onChange={(e) => setUserDensity(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ingresa tu resultado en g/cm³"
                        />
                        {densityError && <p className="text-red-400 text-sm mt-2">{densityError}</p>}
                        <div className="mt-6 text-right">
                            <Button onClick={handleDensityCheck}>Verificar Cálculo</Button>
                        </div>
                    </GlassCard>
                );
            case 7:
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 7: Interpretación de Datos</h2>
                        <p className="mb-4 text-slate-300">Tu resultado es <span className="font-bold text-white">{progress.userCalculatedDensity?.toFixed(2)} g/cm³</span>. Compara este valor con la tabla de densidades de minerales comunes. ¿Cuál crees que es tu muestra?</p>
                        <div className="space-y-3">
                            {MINERAL_DENSITIES.map(mineral => (
                                <label key={mineral.name} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-300 ${mineralChoice === mineral.name ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                    <input type="radio" name="mineral" value={mineral.name} checked={mineralChoice === mineral.name} onChange={(e) => setMineralChoice(e.target.value)} className="w-5 h-5 mr-3 accent-cyan-400"/>
                                    <span className="font-semibold">{mineral.name}:</span>
                                    <span className="ml-2 text-slate-300">{mineral.density}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <Button onClick={() => setStep(8)} disabled={!mineralChoice}>Siguiente</Button>
                        </div>
                    </GlassCard>
                );
            case 8:
                return (
                     <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 8: Justifica tu Conclusión (Comunicación)</h2>
                        <p className="mb-4 text-slate-300">Has identificado la muestra como <span className="font-bold text-fuchsia-400">{mineralChoice}</span>. En una frase, explica por qué llegaste a esa conclusión basándote en tus datos.</p>
                        <textarea
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                             className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ej: La densidad calculada de... se encuentra dentro del rango de..."
                        />
                        <div className="mt-6 text-right">
                            <Button onClick={() => setStep(9)} disabled={!justification.trim()}>Continuar al Etiquetado</Button>
                        </div>
                    </GlassCard>
                );
            case 9:
                return (
                    <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 9: Etiquetado y Almacenamiento</h2>
                        <p className="mb-6 text-slate-300">Un paso crucial es etiquetar correctamente la muestra. Confirma los datos para la etiqueta.</p>
                        <div className="bg-white text-slate-900 p-6 rounded-lg max-w-md mx-auto font-mono border-4 border-dashed border-slate-400">
                            <h3 className="text-xl font-bold border-b-2 border-slate-300 pb-2 mb-4">ETIQUETA DE MUESTRA</h3>
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 items-center">
                                <strong className="text-right">ID MUESTRA:</strong>
                                <span>{userLabel.sampleId}</span>
                                <strong className="text-right">FECHA:</strong>
                                <span>{userLabel.date}</span>
                                <strong className="text-right">MATERIAL:</strong>
                                <span>{userLabel.material}</span>
                                <strong className="text-right">DENSIDAD:</strong>
                                <span>{progress.userCalculatedDensity?.toFixed(2)} g/cm³</span>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                             <Button onClick={handleFinalizeActivity} disabled={isLoading}>
                                {isLoading ? <Spinner /> : "Generar Resumen de Informe"}
                            </Button>
                        </div>
                    </GlassCard>
                );
            case 10:
                return (
                     <GlassCard>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Paso 10: Resumen del Informe (Comunicación)</h2>
                        <p className="mb-4 text-slate-300">La IA ha generado un resumen de tu trabajo en el laboratorio, ideal para la sección de resultados de un informe.</p>
                        <div className="bg-black/20 p-4 rounded-md border border-white/10 text-slate-200">
                            <p>{progress.labReport}</p>
                        </div>
                        <div className="mt-6 text-right">
                            <Button onClick={() => onComplete(progress as UserProgress)} variant="success">Finalizar y Ver Resumen</Button>
                        </div>
                    </GlassCard>
                );
            default:
                return null;
        }
    };
    
    return (
        <div>
            <ProgressBar current={step} total={TOTAL_STEPS} />
            <div className="mt-4 animate-fade-in">
                {renderStep()}
            </div>
        </div>
    );
};

export default ActivityModule;