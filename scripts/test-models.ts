
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
    const apiKey = "AIzaSyA7QSfTUFUr47LDS472bF43-VMhxFT3tC4";
    if (!apiKey) {
        console.error("No API KEY");
        return;
    }

    console.log("Testing specific models...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} WORKS!`);
            // console.log(result.response.text());
            break;
        } catch (e: any) {
            console.log(`❌ ${modelName} failed:`);
            console.log(e);
        }
    }
}

listModels();
