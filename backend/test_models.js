import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function test() {
  const models = [
    "v1beta/models/gemini-flash-latest",
    "v1beta/models/gemini-3.5-flash",
    "v1beta/models/gemini-3-flash-preview"
  ];
  
  for (const model of models) {
    try {
      console.log(`\n--- Testing model ${model} ---`);
      const res = await axios.post(`https://generativelanguage.googleapis.com/${model}:generateContent?key=${key}`, {
        "contents": [{
          "parts": [{"text": "who are you"}]
        }]
      });
      console.log(`Success! Response:`, JSON.stringify(res.data.candidates[0].content.parts[0].text));
    } catch (err) {
      console.error(`Failed for model ${model}:`, err.message);
      if (err.response) {
        console.error(`Status: ${err.response.status}`);
        console.error(`Data:`, JSON.stringify(err.response.data));
      }
    }
  }
}

test();
