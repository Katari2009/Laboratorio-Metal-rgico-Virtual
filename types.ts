export interface UserProgress {
    // Nuevos campos para perfil de usuario y puntuación
    name: string;
    course: string;
    avatar: string;
    score: number;
    completionTimestamp: string;

    // Campos existentes
    selectedEquipment: string[];
    safetyCheck: {
        answer: string;
        correct: boolean;
    };
    userCalculatedDensity: number;
    mineralIdentification: string;
    conclusionJustification: string;
    proposedProcedure: string;
    aiFeedback: string;
    labData: {
        mass: number;
        initialVolume: number;
        finalVolume: number;
        apparentDensity: number;
    };
    labelInfo: {
        sampleId: string;
        date: string;
        material: string;
    };
    labReport: string;
    completed: boolean;
}

export type Screen = 'welcome' | 'activity' | 'summary';
