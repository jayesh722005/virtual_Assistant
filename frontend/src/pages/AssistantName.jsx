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

        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
          <label style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", fontWeight: "500", textAlign: "left", paddingLeft: "4px" }}>Assistant Voice Gender</label>
          <select 
            className="assistant-input" 
            value={assistantVoice || "female"}
            onChange={(e) => setAssistantVoice(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              outline: "none",
              fontSize: "15px",
              cursor: "pointer",
              appearance: "auto"
            }}
          >
            <option value="female" style={{ background: "#181824", color: "#fff" }}>Female (e.g. Zira, Samantha)</option>
            <option value="male" style={{ background: "#181824", color: "#fff" }}>Male (e.g. David, George)</option>
          </select>
        </div>



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