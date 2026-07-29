const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
    constructor() {

        this.apiKey = "AIzaSyBjz0g45p4j9AXLhovHylIcgNtm-8qmRjA";

        this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    async test() {

        const model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash-8b"
        });

        const result = await model.generateContent("Hello");

        console.log(result.response.text());
    }
}

new GeminiService().test();