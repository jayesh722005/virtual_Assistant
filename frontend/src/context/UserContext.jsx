import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const userDatacontext = createContext();

function UserContext({ children }) {
  const ServerURL = "http://localhost:8000";

  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frontend, setfrontend] = useState(null);
  const [backend, setbackend] = useState(null);
  const [assistantName, setAssistantName] = useState("");
  const [assistantVoice, setAssistantVoice] = useState("female");

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(
        `${ServerURL}/api/user/current`,
        {
          withCredentials: true,
        }
      );

      setUserdata(result.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setUserdata(null);
      } else {
        console.error("Error fetching current user:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAssistantDetails = async () => {
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName);
      formData.append("assistantVoice", assistantVoice);
      
      if (backend) {
        // If a file is uploaded
        formData.append("assistantImage", backend);
      } else if (frontend) {
        // If a template/predefined image URL is chosen
        formData.append("assistantImage", frontend);
      }

      const result = await axios.post(
        `${ServerURL}/api/user/update-assistant`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // Update state with new user info
      if (result.data && result.data.user) {
        setUserdata(result.data.user);
      }
      return result.data;
    } catch (error) {
      console.error("Error updating assistant details:", error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await axios.post(`${ServerURL}/api/auth/logout`, {}, { withCredentials: true });
      setUserdata(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const askAssistant = async (prompt) => {
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/ask`,
        { prompt },
        { withCredentials: true }
      );
      if (result.data && result.data.user) {
        setUserdata(result.data.user);
      }
      return result.data;
    } catch (error) {
      console.error("Error asking assistant:", error);
      throw error;
    }
  };

  const editAssistantChat = async (index, prompt) => {
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/edit-chat`,
        { index, prompt },
        { withCredentials: true }
      );
      if (result.data && result.data.user) {
        setUserdata(result.data.user);
      }
      return result.data;
    } catch (error) {
      console.error("Error editing assistant chat:", error);
      throw error;
    }
  };

  const deleteAssistantChat = async (index) => {
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/delete-chat`,
        { index },
        { withCredentials: true }
      );
      if (result.data && result.data.user) {
        setUserdata(result.data.user);
      }
      return result.data;
    } catch (error) {
      console.error("Error deleting assistant chat:", error);
      throw error;
    }
  };

  const generateNotes = async (syllabus, difficulty, marks) => {
    try {
      const result = await axios.post(
        `${ServerURL}/api/user/generate-notes`,
        { syllabus, difficulty, marks },
        { withCredentials: true }
      );
      if (result.data && result.data.user) {
        setUserdata(result.data.user);
      }
      return result.data;
    } catch (error) {
      console.error("Error generating notes:", error);
      throw error;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const result = await axios.delete(
        `${ServerURL}/api/user/delete-notes/${noteId}`,
        { withCredentials: true }
      );
      if (result.data && result.data.user) {
        setUserdata(result.data.user);
      }
      return result.data;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (userdata) {
      if (userdata.assistantName) {
        setAssistantName(userdata.assistantName);
      }
      if (userdata.assistantImage) {
        setfrontend(userdata.assistantImage);
      }
      if (userdata.assistantVoice) {
        setAssistantVoice(userdata.assistantVoice);
      }
    } else {
      setAssistantName("");
      setfrontend(null);
      setbackend(null);
      setAssistantVoice("female");
    }
  }, [userdata]);

  useEffect(() => {
    handleCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <userDatacontext.Provider
      value={{
        ServerURL,
        userdata,
        setUserdata,
        loading,
        frontend,
        setfrontend,
        backend,
        setbackend,
        assistantName,
        setAssistantName,
        assistantVoice,
        setAssistantVoice,
        updateAssistantDetails,
        logoutUser,
        askAssistant,
        editAssistantChat,
        deleteAssistantChat,
        generateNotes,
        deleteNote,
      }}
    >
      {children}
    </userDatacontext.Provider>
  );
}

export default UserContext;