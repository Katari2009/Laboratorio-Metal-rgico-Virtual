import type { UserProgress } from '../types';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

export const generatePdfReport = async (progress: UserProgress): Promise<void> => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Informe de Laboratorio Virtual', docWidth / 2, 25, { align: 'center' });
    
    // --- Student Info ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Estudiante:', margin, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(progress.name, margin + 30, 45);

    doc.setFont('helvetica', 'bold');
    doc.text('Curso:', margin, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(progress.course, margin + 30, 52);

    const completionDate = new Date(progress.completionTimestamp);
    const formattedDate = `${completionDate.toLocaleDateString('es-CL')} ${completionDate.toLocaleTimeString('es-CL')}`;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', margin, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate, margin + 30, 59);

    // --- Avatar ---
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = progress.avatar;
    await new Promise(resolve => {
        img.onload = resolve;
    });
    doc.addImage(img, 'JPEG', docWidth - margin - 30, 40, 30, 30);
    
    // --- Score ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 212, 191); // Tailwind's teal-400
    doc.text(`Puntaje Total Obtenido: ${progress.score} / 100`, docWidth / 2, 80, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset color

    // --- Line separator ---
    doc.setDrawColor(200);
    doc.line(margin, 90, docWidth - margin, 90);

    let yPosition = 100;

    // --- Helper function for text blocks ---
    const addTextBlock = (title: string, content: string | string[]) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const splitContent = doc.splitTextToSize(Array.isArray(content) ? content.join('\n') : content, docWidth - (margin * 2));
        doc.text(splitContent, margin, yPosition);
        yPosition += (splitContent.length * 5) + 10;
    };

    // --- Results Section ---
    const resultsContent = [
        `- Densidad Aparente Calculada: ${progress.labData.apparentDensity.toFixed(2)} g/cm³`,
        `- Identificación del Mineral: ${progress.mineralIdentification}`,
        `- Justificación: "${progress.conclusionJustification}"`,
        `- Respuesta de Seguridad: ${progress.safetyCheck.correct ? 'Correcta' : 'Incorrecta'}`,
    ];
    addTextBlock('Resumen de Resultados', resultsContent);

    // --- AI Report Section ---
    addTextBlock('Resumen del Informe Generado por IA', progress.labReport);

    // --- Proposed Procedure Section ---
    addTextBlock('Procedimiento Propuesto por el Estudiante', `"${progress.proposedProcedure}"`);

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} | Laboratorio Metalúrgico Virtual`, docWidth / 2, docHeight - 10, { align: 'center' });
    }
    
    doc.save(`Informe_${progress.name.replace(/ /g, '_')}.pdf`);
};
