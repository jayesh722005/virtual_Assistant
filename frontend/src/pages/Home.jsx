import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userDatacontext } from "../context/UserContext";
import "../Css/Home.css";

import image1 from "../assets/image1.png";

function Home() {
  const { userdata, logoutUser, askAssistant, editAssistantChat, deleteAssistantChat } = useContext(userDatacontext);
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Edit Chat states
  const [editingIdx, setEditingIdx] = useState(null);
  const [editInput, setEditInput] = useState("");

  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleLogout = async () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    await logoutUser();
    navigate("/signin");
  };

  const assistantImg = userdata?.assistantImage || image1;
  const assistantName = userdata?.assistantName || "Virtual Assistant";

  // Parse chat history from DB
  const chatHistory = userdata?.history ? userdata.history.map(item => {
    try {
      return JSON.parse(item);
    } catch(e) {
      // Fallback if not stringified JSON
      return { sender: "user", text: item };
    }
  }) : [];

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userdata?.history, isResponding]);

  // Greeting on mount
  const hasGreeted = useRef(false);
  useEffect(() => {
    if (userdata && userdata.name && !hasGreeted.current) {
      const greetingText = `Hello ${userdata.name}, what can I help you with?`;
      speakText(greetingText);
      hasGreeted.current = true;
    }
  }, [userdata]);

  // Text to Speech
  const speakText = (text, idx = null) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(idx);
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      
      // Filter by language first
      const langVoices = voices.filter(v => v.lang.includes("en-US") || v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
      
      const preferredGender = userdata?.assistantVoice || "female";
      
      // Select best voice prioritizing Google and high quality natural voices
      let selectedVoice = langVoices.find(v => {
        const name = v.name.toLowerCase();
        if (preferredGender === "male") {
          return name.includes("male") && (name.includes("google") || name.includes("natural") || name.includes("david"));
        } else {
          return !name.includes("male") && (name.includes("google") || name.includes("natural") || name.includes("samantha") || name.includes("zira"));
        }
      });

      if (!selectedVoice) {
        selectedVoice = langVoices.find(v => {
          const name = v.name.toLowerCase();
          if (preferredGender === "male") {
            return name.includes("male") || name.includes("david") || name.includes("ravi") || name.includes("george") || name.includes("daniel") || name.includes("rishi");
          } else {
            if (name.includes("male")) return false;
            return name.includes("female") || name.includes("zira") || name.includes("samantha") || name.includes("heera") || name.includes("hazel") || name.includes("haruka") || name.includes("karen") || name.includes("moira") || name.includes("tessa") || name.includes("veena");
          }
        });
      }

      if (!selectedVoice && langVoices.length > 0) {
        selectedVoice = langVoices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onend = () => {
        setSpeakingIdx(null);
      };
      utterance.onerror = () => {
        setSpeakingIdx(null);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition
  const handleListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      
      // Only alert on permission denial. Do not alert for 'no-speech' or other normal end states.
      if (event.error === "not-allowed") {
        alert("Microphone access is blocked/denied. Please allow microphone permission in your browser settings to use this feature.");
      } else if (event.error === "network") {
        alert("Network error. Speech recognition requires an active internet connection.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const speechToText = event.results[0][0].transcript;

      // Repeat what the user asked
      speakText(speechToText);

      // Call context function to send prompt to Gemini & save in DB history
      setIsResponding(true);
      try {
        const data = await askAssistant(speechToText);
        if (data && data.answer) {
          // Speak Gemini response and associate it with the correct message index
          const newIdx = chatHistory.length + 1;
          speakText(data.answer, newIdx);
        }
      } catch (err) {
        console.error(err);
        speakText("Error connecting to the assistant server.");
      } finally {
        setIsResponding(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      alert("Could not start speech recognition: " + e.message);
    }
  };

  const handleEditSubmit = async (idx) => {
    if (!editInput || editInput.trim() === "") return;
    setIsResponding(true);
    setEditingIdx(null);

    try {
      const data = await editAssistantChat(idx, editInput);
      if (data && data.answer) {
        speakText(data.answer, idx + 1);
      }
    } catch (err) {
      console.error(err);
      speakText("Error updating assistant response.");
    } finally {
      setIsResponding(false);
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setIsResponding(true);
    try {
      await deleteAssistantChat(idx);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResponding(false);
    }
  };

  const handleSpeakBubble = (text, idx) => {
    if ("speechSynthesis" in window) {
      if (speakingIdx === idx) {
        window.speechSynthesis.cancel();
        setSpeakingIdx(null);
      } else {
        window.speechSynthesis.cancel();
        setSpeakingIdx(idx);
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter(v => v.lang.includes("en-US") || v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
        const preferredGender = userdata?.assistantVoice || "female";
        
        let selectedVoice = langVoices.find(v => {
          const name = v.name.toLowerCase();
          if (preferredGender === "male") {
            return name.includes("male") && (name.includes("google") || name.includes("natural") || name.includes("david"));
          } else {
            return !name.includes("male") && (name.includes("google") || name.includes("natural") || name.includes("samantha") || name.includes("zira"));
          }
        });

        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => {
            const name = v.name.toLowerCase();
            if (preferredGender === "male") {
              return name.includes("male") || name.includes("david") || name.includes("ravi") || name.includes("george") || name.includes("daniel") || name.includes("rishi");
            } else {
              if (name.includes("male")) return false;
              return name.includes("female") || name.includes("zira") || name.includes("samantha") || name.includes("heera") || name.includes("hazel") || name.includes("haruka") || name.includes("karen") || name.includes("moira") || name.includes("tessa") || name.includes("veena");
            }
          });
        }
        
        if (!selectedVoice && langVoices.length > 0) {
          selectedVoice = langVoices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.onend = () => {
          setSpeakingIdx(null);
        };
        utterance.onerror = () => {
          setSpeakingIdx(null);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleExportChat = (format) => {
    if (!chatHistory || chatHistory.length === 0) {
      alert("No chat history to export!");
      return;
    }

    let fileContent = "";
    let mimeType = "text/plain";
    let fileName = `chat_history_${Date.now()}`;

    if (format === "json") {
      fileContent = JSON.stringify(chatHistory, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    } else if (format === "markdown") {
      fileContent = `# Chat History with ${assistantName}\n\n`;
      fileContent += `**User:** ${userdata?.name || "User"}\n`;
      fileContent += `**Date:** ${new Date().toLocaleString()}\n\n`;
      fileContent += `---\n\n`;
      chatHistory.forEach((chat) => {
        const senderLabel = chat.sender === "user" ? "You" : assistantName;
        fileContent += `### **${senderLabel}**\n${chat.text}\n\n`;
      });
      mimeType = "text/markdown";
      fileName += ".md";
    } else if (format === "txt") {
      fileContent = `Chat History with ${assistantName}\n`;
      fileContent += `User: ${userdata?.name || "User"}\n`;
      fileContent += `Date: ${new Date().toLocaleString()}\n\n`;
      fileContent += `========================================\n\n`;
      chatHistory.forEach((chat) => {
        const senderLabel = chat.sender === "user" ? "You" : assistantName;
        fileContent += `${senderLabel}:\n${chat.text}\n\n`;
      });
      mimeType = "text/plain";
      fileName += ".txt";
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Pop-up blocked! Please allow pop-ups for this website to export the chat as a PDF.");
        return;
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Chat History with ${assistantName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #333;
                background-color: #fff;
              }
              h1 {
                color: #0a192f;
                border-bottom: 2px solid #00ffcc;
                padding-bottom: 10px;
              }
              .meta {
                color: #666;
                font-size: 14px;
                margin-bottom: 20px;
              }
              .chat-bubble {
                margin-bottom: 15px;
                padding: 15px;
                border-radius: 8px;
                position: relative;
              }
              .user {
                border-left: 4px solid #3a8dff;
                background-color: #f0f7ff;
              }
              .assistant {
                border-left: 4px solid #00ffcc;
                background-color: #f5fcf9;
              }
              .label {
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
                color: #555;
              }
              .text {
                font-size: 14px;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>
            <h1>Chat History with ${assistantName}</h1>
            <div class="meta">
              <strong>User:</strong> ${userdata?.name || "User"}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <hr style="border: 0; border-top: 1px solid #ccc; margin-bottom: 20px;" />
            ${chatHistory.map((chat) => {
              const senderLabel = chat.sender === "user" ? "You" : assistantName;
              const typeClass = chat.sender === "user" ? "user" : "assistant";
              return `
                <div class="chat-bubble ${typeClass}">
                  <div class="label">${senderLabel}</div>
                  <div class="text">${chat.text}</div>
                </div>
              `;
            }).join("")}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#00ffcc', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="logo-text">AI.ASSIST</div>

        <div className="header-buttons">
          <div className="export-dropdown" style={{ position: "relative" }}>
            <button
              className="export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export Chat
            </button>

            {showExportMenu && (
              <div
                className="export-menu"
                style={{
                  position: "absolute",
                  top: "45px",
                  right: "0",
                  background: "#181824",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  zIndex: 100,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  width: "180px"
                }}
              >
                <button
                  onClick={() => { handleExportChat("pdf"); setShowExportMenu(false); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    padding: "8px 12px",
                    textAlign: "left",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "background 0.2s ease"
                  }}
                >
                  📄 Export as PDF
                </button>
                <button
                  onClick={() => { handleExportChat("markdown"); setShowExportMenu(false); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    padding: "8px 12px",
                    textAlign: "left",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "background 0.2s ease"
                  }}
                >
                  📝 Export as Markdown (.md)
                </button>
                <button
                  onClick={() => { handleExportChat("json"); setShowExportMenu(false); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    padding: "8px 12px",
                    textAlign: "left",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "background 0.2s ease"
                  }}
                >
                  ⚙️ Export as JSON
                </button>
              </div>
            )}
          </div>

          <button
            className="customize-btn"
            onClick={() => {
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              navigate("/customize");
            }}
          >
            Customize Assistant
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="home-content">
        <div className="assistant-avatar-container">
          <img src={assistantImg} alt={assistantName} className="assistant-avatar" />
        </div>

        <div className="welcome-user">
          Welcome back, {userdata?.name || "User"}!
        </div>

        <h1 className="assistant-greeting">
          Hello, I am <span>{assistantName}</span>
        </h1>

        <div className="assistant-status">
          <div className="status-dot"></div>
          Online & Ready
        </div>

        {/* Voice Assistant Section */}
        <div className="voice-assistant-section">
          {/* Mic Button */}
          <button 
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleListen}
            disabled={isResponding}
          >
            <div className="mic-icon-wrapper">
              {isListening ? (
                <div className="pulse-waves">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : isResponding ? (
                <div className="assistant-spinner"></div>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </div>
            <span className="mic-btn-text">
              {isListening ? "Listening..." : isResponding ? "Thinking..." : "Tap to Speak"}
            </span>
          </button>

          {/* Interactive Chat Display with Persistent History */}
          {(chatHistory.length > 0 || isResponding) && (
            <div className="chat-display-card" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {chatHistory.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`chat-bubble ${chat.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}
                >
                  <div className="bubble-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="bubble-label">{chat.sender === 'user' ? 'You' : assistantName}:</span>
                    {chat.sender === 'user' && editingIdx !== idx && (
                      <div className="bubble-actions-group" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="edit-bubble-btn" 
                          onClick={() => {
                            setEditingIdx(idx);
                            setEditInput(chat.text);
                          }}
                          title="Edit Question"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="delete-bubble-btn" 
                          onClick={() => handleDelete(idx)}
                          title="Delete Question"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {chat.sender === 'user' && editingIdx === idx ? (
                    <div className="bubble-edit-form" style={{ width: '100%' }}>
                      <textarea
                        className="edit-bubble-input"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '8px',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          fontSize: '14px'
                        }}
                      />
                      <div className="edit-bubble-actions" style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="edit-save-btn" 
                          onClick={() => handleEditSubmit(idx)}
                          style={{
                            background: '#00ffcc',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button 
                          className="edit-cancel-btn" 
                          onClick={() => setEditingIdx(null)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: 0, paddingBottom: chat.sender !== 'user' ? '20px' : '0' }}>
                        {renderMessageText(chat.text)}
                      </p>
                      {chat.sender !== 'user' && (
                        <button
                          className="speak-bubble-btn"
                          onClick={() => handleSpeakBubble(chat.text, idx)}
                          style={{
                            position: "absolute",
                            right: "8px",
                            bottom: "6px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: speakingIdx === idx ? "#00ffcc" : "rgba(255, 255, 255, 0.5)",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease"
                          }}
                          title={speakingIdx === idx ? "Mute answer" : "Speak answer"}
                        >
                          {speakingIdx === idx ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                              <line x1="23" y1="9" x2="17" y2="15"></line>
                              <line x1="17" y1="9" x2="23" y2="15"></line>
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              {isResponding && (
                <div className="chat-bubble assistant-bubble typing">
                  <span className="bubble-label">{assistantName}:</span>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;