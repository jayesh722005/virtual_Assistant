import axios from "axios"

const fallbackResponses = {
  "hello": "Hello! How can I help you today?",
  "hi": "Hey there! What's on your mind?",
  "who are you": "I am Jarvis, your virtual assistant.",
  "how are you": "I am doing great, thank you!",
  "your name": "I am Jarvis, your virtual assistant.",
  "creator": "I was created by Jayesh.",
  "created you": "I was created by Jayesh.",
  "joke": "Why don't scientists trust atoms? Because they make up everything!"
};

const getCleanQuery = (prompt) => {
  let q = prompt.toLowerCase();
  if (q.includes("answer in extremely simple")) {
     q = q.split(".")[0]; // take only the first sentence
  }
  q = q.replace("what is", "")
       .replace("who is", "")
       .replace("tell me about", "")
       .replace("define", "")
       .replace("explain", "")
       .trim();
  if (q.endsWith("?")) {
     q = q.slice(0, -1);
  }
  return q.trim();
};

const queryDuckDuckGo = async (query) => {
    try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.data.AbstractText) {
            return res.data.AbstractText;
        }
        if (res.data.RelatedTopics && res.data.RelatedTopics.length > 0 && res.data.RelatedTopics[0].Text) {
            return res.data.RelatedTopics[0].Text;
        }
        return null;
    } catch (e) {
        console.error("DuckDuckGo fetch failed:", e.message);
        return null;
    }
}

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
        const cleanPrompt = prompt.toLowerCase();
        
        // 1. Try matching local conversational keywords
        let basePrompt = cleanPrompt;
        if (basePrompt.includes("answer in extremely simple")) {
            basePrompt = basePrompt.split(".")[0]; // Extract only the actual question
        }
        
        for (const [key, value] of Object.entries(fallbackResponses)) {
            if (basePrompt.includes(key)) {
                return {
                    candidates: [{
                        content: {
                            parts: [{ text: value }]
                        }
                    }]
                };
            }
        }
        
        // 2. Try fetching from DuckDuckGo Instant Answer API (No API key needed!)
        const cleanQuery = getCleanQuery(prompt);
        if (cleanQuery) {
            const searchAnswer = await queryDuckDuckGo(cleanQuery);
            if (searchAnswer) {
                // Return only the first sentence of the search answer to keep it 1-line and conversational
                const oneLineAnswer = searchAnswer.split(".")[0] + ".";
                return {
                    candidates: [{
                        content: {
                            parts: [{ text: oneLineAnswer }]
                        }
                    }]
                };
            }
        }
        
        // 3. Last resort fallback
        return {
            candidates: [{
                content: {
                    parts: [{ text: "Google's servers are busy right now. Ask me any factual question!" }]
                }
            }]
        };
    }
}

export default GeminiResponse;
