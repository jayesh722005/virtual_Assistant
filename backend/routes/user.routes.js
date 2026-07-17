import express from "express";
import { getCurrentUser, updateAssistant, askAssistant, editChat, deleteChat, generateNotes, deleteNote } from "../controllers/user.controller.js";
import isAuth from "../middlewheres/isAuth.js";
import upload from "../middlewheres/multer.js";

const userRouter = express.Router();

// Get Current Logged In User
userRouter.get("/current", getCurrentUser);

// Update Assistant Name and Image
userRouter.post("/update-assistant", isAuth, upload.single("assistantImage"), updateAssistant);

// Ask Gemini Assistant (authenticated)
userRouter.post("/ask", isAuth, askAssistant);

// Edit User Question and Regenerate Response (authenticated)
userRouter.post("/edit-chat", isAuth, editChat);

// Delete User Question and Assistant Response (authenticated)
userRouter.post("/delete-chat", isAuth, deleteChat);

// Prepare Notes Routes
userRouter.post("/generate-notes", isAuth, generateNotes);
userRouter.delete("/delete-notes/:noteId", isAuth, deleteNote);

export default userRouter;