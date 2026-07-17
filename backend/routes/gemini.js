import axios from "axios"

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
        console.error("Gemini API call failed. Error message:", error.message);
        if (error.response) {
            console.error("Error response status:", error.response.status);
            console.error("Error response data:", JSON.stringify(error.response.data));
            if (error.response.status === 429) {
                return { error: "Rate limit exceeded (429). The current Gemini API key has reached its request limit. Please update the API key in the backend `.env` file with your own key from Google AI Studio." };
            }
        }
        return { error: error.message };
    }
}

export default GeminiResponse;
