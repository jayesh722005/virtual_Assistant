import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import uploadCloudinary from "../config/cloudinary.js";

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    // If no token exists, the user is simply logged out. Return 200 OK with null.
    if (!token) {
      return res.status(200).json(null);
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verifyToken.userId).select("-password");

    // If user no longer exists in DB, treat as logged out.
    if (!user) {
      return res.status(200).json(null);
    }

    return res.status(200).json(user);
  } catch (error) {
    // If token is expired or invalid, treat as logged out. Return 200 OK with null.
    return res.status(200).json(null);
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const userId = req.userId;
    const { assistantName, assistantVoice } = req.body;
    let assistantImageUrl = req.body.assistantImage;

    console.log("Backend updateAssistant received:", {
      userId,
      assistantName,
      assistantVoice,
      assistantImageUrl,
      file: req.file ? req.file.path : null
    });

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload to Cloudinary if image is uploaded
    if (req.file) {
      const cloudinaryUrl = await uploadCloudinary(req.file.path);
      if (cloudinaryUrl) {
        assistantImageUrl = cloudinaryUrl;
      }
    }

    // If assistantImageUrl is provided (either from body or uploaded to cloudinary), update it
    if (assistantImageUrl) {
      user.assistantImage = assistantImageUrl;
    }
    if (assistantName) {
      user.assistantName = assistantName;
    }
    if (assistantVoice) {
      user.assistantVoice = assistantVoice;
    }

    await user.save();

    // Return the updated user (excluding password)
    const updatedUser = await User.findById(userId).select("-password");
    return res.status(200).json({
      message: "Assistant details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating assistant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

import GeminiResponse from "../routes/gemini.js";

export const askAssistant = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Call Gemini API
    const customPrompt = `${prompt}. Answer in extremely simple, plain, and easy-to-understand language. Keep it conversational and limit your response to exactly 3 lines.`;
    const data = await GeminiResponse(customPrompt);

    let answer = "I couldn't fetch an answer right now.";
    if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      answer = data.candidates[0].content.parts[0].text;
    } else if (data && data.error) {
      answer = `Error: ${data.error}`;
    }

    // Save to user history as JSON string
    user.history.push(JSON.stringify({ sender: "user", text: prompt }));
    user.history.push(JSON.stringify({ sender: "assistant", text: answer }));
    await user.save();

    // Get updated user details (excluding password)
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      answer,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in askAssistant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { index, prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Call Gemini API for the new prompt
    const customPrompt = `${prompt}. Answer in extremely simple, plain, and easy-to-understand language. Keep it conversational and limit your response to exactly 3 lines.`;
    const data = await GeminiResponse(customPrompt);

    let answer = "I couldn't fetch an answer right now.";
    if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      answer = data.candidates[0].content.parts[0].text;
    } else if (data && data.error) {
      answer = `Error: ${data.error}`;
    }

    // Update history at the specific index
    if (user.history && user.history[index]) {
      user.history[index] = JSON.stringify({ sender: "user", text: prompt });
    }
    if (user.history && user.history[index + 1]) {
      user.history[index + 1] = JSON.stringify({ sender: "assistant", text: answer });
    }

    user.markModified("history");
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      answer,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in editChat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { index } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user message (at index) and assistant answer (at index + 1)
    if (user.history && user.history.length > index) {
      user.history.splice(index, 2);
    }

    user.markModified("history");
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: "Chat message deleted successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in deleteChat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const generateNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const { syllabus, difficulty, marks } = req.body;

    if (!syllabus || !difficulty || !marks) {
      return res.status(400).json({ message: "All fields are required (syllabus, difficulty, marks)" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const customPrompt = `You are a professional educational assistant.
Generate comprehensive, structured study notes and detailed answers/solutions based on the following details:
Syllabus / Content / Questions: ${syllabus}
Difficulty Level: ${difficulty}
Marks per Question: ${marks} Marks

Instructions for output structure:
1. "Study Notes": Provide deep, detailed explanations of all key topics, concepts, and formulas described in the syllabus. Use clear headings, bullet points, and clean formatting.
2. "Questions & Detailed Answers": Identify any questions or main topics mentioned in the syllabus, and generate comprehensive, step-by-step model answers/solutions for them. If no explicit questions are written, generate relevant practice questions based on the syllabus. Format each answer to match a ${difficulty}-level question worth ${marks} marks.

Formatting: Use markdown structure (h1, h2, bold, list items) to format the notes nicely.`;

    const data = await GeminiResponse(customPrompt);

    let content = "";
    if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      content = data.candidates[0].content.parts[0].text;
    } else {
      const errorMsg = data && data.error ? data.error : "Failed to generate notes due to an unknown API error.";
      const isRateLimit = errorMsg.includes("429") || errorMsg.toLowerCase().includes("limit") || errorMsg.toLowerCase().includes("too many requests");
      return res.status(isRateLimit ? 429 : 500).json({ message: errorMsg });
    }

    const topicExcerpt = syllabus.length > 40 ? syllabus.substring(0, 40) + "..." : syllabus;
    const title = `Notes on ${topicExcerpt}`;

    const newNote = {
      title,
      syllabus,
      difficulty,
      marks: Number(marks),
      content,
      createdAt: new Date()
    };

    user.notes.push(newNote);
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      note: user.notes[user.notes.length - 1],
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in generateNotes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const userId = req.userId;
    const { noteId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notes = user.notes.filter(note => note._id.toString() !== noteId);
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: "Note deleted successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in deleteNote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
