import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
let apiKeyError: string | null = null;

// Initialize the AI client safely
try {
    // The API key is read from environment variables.
    // On platforms like Vercel, it needs to be exposed to the client-side,
    // often by prefixing it (e.g., VITE_API_KEY or NEXT_PUBLIC_API_KEY).
    const apiKey = process.env.API_KEY;

    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        apiKeyError = "La variable de entorno API_KEY no está configurada. En tu plataforma de despliegue (ej. Vercel), asegúrate de que la variable esté disponible para el cliente (frontend). A menudo, esto requiere un prefijo especial como `VITE_` o `NEXT_PUBLIC_`.";
        console.error(apiKeyError);
    }
} catch (error) {
    // This catches errors like "process is not defined" if the build environment doesn't support it.
    apiKeyError = "Error al acceder a las variables de entorno. El entorno de compilación de la aplicación no parece estar configurado para manejar `process.env`.";
    console.error(apiKeyError, error);
}


export const evaluateProcedure = async (procedure: string): Promise<string> => {
    if (apiKeyError) {
        return `Error de Configuración: ${apiKeyError}`;
    }
    if (!ai) {
        // Fallback, should be covered by apiKeyError
        return "Error: La clave de API de Gemini no está configurada. La aplicación no puede contactar a la IA.";
    }

    const prompt = `
        Eres un instructor de laboratorio de química experimentado y servicial. 
        Un estudiante de metalurgia ha propuesto el siguiente procedimiento para medir la densidad aparente de una muestra de mena de cobre oxidado.
        
        Procedimiento del estudiante:
        "${procedure}"

        Tu tarea es evaluar el procedimiento en cuanto a corrección, seguridad y claridad. 
        Proporciona retroalimentación constructiva. En lugar de dar la respuesta directamente, haz preguntas que guíen al estudiante hacia el procedimiento correcto.
        Mantén un tono alentador y educativo. Estructura tu respuesta en puntos claros.
        Por ejemplo, si omiten el uso de una balanza, podrías preguntar: "¿Qué instrumento necesitas para medir la masa de la muestra?".
        Si el procedimiento es inseguro, resalta el riesgo y pregunta por una alternativa más segura.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error evaluating procedure with Gemini:", error);
        return "Hubo un error al contactar a la IA. Por favor, revisa la consola para más detalles y asegúrate de que tu clave de API sea correcta.";
    }
};

export const generateLabReport = async (data: any): Promise<string> => {
    if (apiKeyError) {
        return `Error de Configuración: ${apiKeyError}`;
    }
    if (!ai) {
        // Fallback
        return "Error: La clave de API de Gemini no está configurada. No se puede generar el informe.";
    }

    const prompt = `
      Eres un redactor científico. Basándote en los siguientes datos de laboratorio, redacta un resumen conciso, claro y creativo para un informe de laboratorio.
      El resumen debe comunicar eficazmente el objetivo, el método, los resultados y una breve conclusión.

      Objetivo: Determinar la densidad aparente de una muestra de mena de cobre oxidado.

      Datos Recopilados:
      - ID de la Muestra: ${data.labelInfo.sampleId}
      - Fecha: ${data.labelInfo.date}
      - Material: ${data.labelInfo.material}
      - Masa de la muestra: ${data.labData.mass} g
      - Volumen inicial del agua: ${data.labData.initialVolume} ml
      - Volumen final (agua + muestra): ${data.labData.finalVolume} ml
      - Densidad aparente calculada: ${data.labData.apparentDensity.toFixed(2)} g/cm³
      
      Procedimiento Seguido: Se midió la masa de la muestra con una balanza. Luego, se determinó el volumen de la muestra por el método de desplazamiento de agua en una probeta. La densidad se calculó dividiendo la masa por el volumen desplazado.

      Genera un párrafo de resumen del informe.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating lab report with Gemini:", error);
        return "No se pudo generar el informe del laboratorio debido a un error con la IA.";
    }
};