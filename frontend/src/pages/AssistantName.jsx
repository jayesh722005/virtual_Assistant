import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userDatacontext } from "../context/UserContext.jsx";
import "../Css/Customize.css";

function AssistantName() {
  const {
    assistantName,
    setAssistantName,
    assistantVoice,
    setAssistantVoice,
    frontend,
    updateAssistantDetails,
  } = useContext(userDatacontext);

  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    if (!assistantName || assistantName.trim() === "") {
      alert("Please enter a name for your assistant");
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateAssistantDetails();

      if (response && response.user) {
        console.log("Logged In User:", response.user);
      }

      navigate("/");
    } catch (error) {
      alert("Failed to save assistant settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="customize">

      {/* Back Button */}
      <div
        className="back-btn"
        onClick={() => navigate("/customize")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </div>

      <div className="assistant-container">
        <h1 className="assistant-title">
          Name your Assistant
        </h1>

        {frontend && (
          <div className="assistant-image">
            <img src={frontend} alt="Assistant Preview" />
          </div>
        )}

        <input
          type="text"
          className="assistant-input"
          placeholder="Enter assistant name..."
          value={assistantName || ""}
          onChange={(e) => setAssistantName(e.target.value)}
        />



        <button
          className="next-btn"
          onClick={handleNext}
          disabled={isSaving}
        >
          {isSaving ? "Loading..." : "Finally create your Assistant"}
        </button>
      </div>
    </div>
  );
}

export default AssistantName;