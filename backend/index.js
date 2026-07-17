import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import dns from "dns";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import GeminiResponse from "./routes/gemini.js";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";

dotenv.config(); // trigger restart to load new api key

// DNS Server
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const app = express();
const port = process.env.PORT || 5000;

// Connect Frontend with Backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Home Route
// app.get("/", (req, res) => {
//   res.send("Hii Lounde");
// });

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.get("/",async(req,res)=>
{
  try {
    let prompt=req.query.prompt;
    let customPrompt = `${prompt}. Answer in extremely simple, plain, and easy-to-understand language. Keep it conversational and limit your response to exactly 3 lines.`;
    let data=await GeminiResponse(customPrompt);

    let answer = "I couldn't fetch an answer right now.";
    if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      answer = data.candidates[0].content.parts[0].text;
    } else if (data && data.error) {
      answer = `Error: ${data.error}`;
    }

    // Save to user history if user is authenticated (reads cookie)
    const token = req.cookies?.token;
    if (token) {
      try {
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verifyToken.userId);
        if (user) {
          user.history.push(JSON.stringify({ sender: "user", text: prompt }));
          user.history.push(JSON.stringify({ sender: "assistant", text: answer }));
          await user.save();
          console.log(`Saved direct query history for user: ${user.name}`);
        }
      } catch (err) {
        console.log("Not saving history: Token invalid or expired:", err.message);
      }
    }

    res.send(data);
  } catch (error) {
    console.error("Error in direct query:", error);
    res.status(500).json({ error: error.message });
  }
})

// Silence favicon.ico 404 errors
app.get("/favicon.ico", (req, res) => res.status(204).end());


// Database Connection & Server Start
connectDB();

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});