import axios from "axios"

const fallbackResponses = {
  "hello": "Hello! How can I help you today?",
  "hi": "Hey there! What's on your mind?",
  "who are you": "I am Jarvis, your virtual assistant. How can I help you today?",
  "how are you": "I am doing great, thank you! How can I help you?",
  "javascript": "JavaScript is a programming language used to make websites interactive.",
  "typescript": "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
  "mongodb": "MongoDB is a document-based NoSQL database used for high-volume data storage.",
  "react": "React is a JavaScript library for building user interfaces.",
  "node": "Node.js is a runtime that lets you run JavaScript code on the server."
};

const GeminiResponse = async (prompt) => {
    try {
        const apiurl = process.env.Gemini_API_URL;
        console.log("Calling Gemini API at:", apiurl, "with prompt:", prompt);
        
        const result = await axios.post(apiurl, { 
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        });
        
        console.log("Gemini API returned status:", result.status);
        return result.data;
    }
    catch (error) {
        console.error("Gemini API call failed. Falling back to local offline mock. Error message:", error.message);
        
        // Find best match in fallback responses
        const cleanPrompt = prompt.toLowerCase();
        for (const [key, value] of Object.entries(fallbackResponses)) {
            if (cleanPrompt.includes(key)) {
                return {
                    candidates: [{
                        content: {
                            parts: [{ text: value }]
                        }
                    }]
                };
            }
        }
        
        // Default backup reply if no keyword matches
        return {
            candidates: [{
                content: {
                    parts: [{ text: "Google's servers are overloaded right now. Ask me about JavaScript, TypeScript, or MongoDB!" }]
                }
            }]
        };
    }
}

export default GeminiResponse;
