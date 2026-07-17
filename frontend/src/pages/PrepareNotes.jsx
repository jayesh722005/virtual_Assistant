import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userDatacontext } from "../context/UserContext.jsx";
import "../Css/PrepareNotes.css";

function PrepareNotes({ isModal = false, onClose }) {
  const { userdata, generateNotes, deleteNote } = useContext(userDatacontext);
  const navigate = useNavigate();

  const [syllabus, setSyllabus] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [marks, setMarks] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  // Notes list from userdata
  const notesList = userdata?.notes || [];

  // Automatically select the newest note when generated
  useEffect(() => {
    if (notesList.length > 0 && !selectedNoteId) {
      // Select the first one or most recent one
      setSelectedNoteId(notesList[notesList.length - 1]._id);
    }
  }, [notesList, selectedNoteId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!syllabus.trim()) {
      alert("Please enter syllabus or topics details.");
      return;
    }
    if (marks <= 0) {
      alert("Marks must be greater than 0.");
      return;
    }

    setGenerating(true);
    try {
      const data = await generateNotes(syllabus, difficulty, marks);
      if (data && data.note) {
        setSelectedNoteId(data.note._id);
        // Clear syllabus input upon success
        setSyllabus("");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        alert("Gemini API rate limit reached (Too Many Requests). Please wait a few seconds and click Generate Notes again.");
      } else if (err.response?.data?.message) {
        alert(`Failed to generate notes: ${err.response.data.message}`);
      } else {
        alert("Failed to generate notes. Please check your network and try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (noteId, e) => {
    e.stopPropagation(); // Avoid selecting the card
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(noteId);
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find currently active note
  const activeNote = notesList.find((note) => note._id === selectedNoteId);

  // Pure React Markdown Parser
  const parseBold = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  const parseMarkdown = (markdownText) => {
    if (!markdownText) return null;
    const lines = markdownText.split("\n");
    let inList = false;
    let listItems = [];
    const elements = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Bullet lists
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
      } else {
        // If list ended, push the accumulated list items
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: "10px 0 15px 20px" }}>
              {listItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "6px" }}>{parseBold(item)}</li>
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }

        if (trimmed.startsWith("### ")) {
          elements.push(<h3 key={index} style={{ fontSize: "16px", color: "#00ffcc", marginTop: "20px", marginBottom: "10px" }}>{parseBold(trimmed.substring(4))}</h3>);
        } else if (trimmed.startsWith("## ")) {
          elements.push(<h2 key={index} style={{ fontSize: "18px", color: "#00ffcc", marginTop: "22px", marginBottom: "10px" }}>{parseBold(trimmed.substring(3))}</h2>);
        } else if (trimmed.startsWith("# ")) {
          elements.push(<h1 key={index} style={{ fontSize: "22px", color: "#00ffcc", marginTop: "24px", marginBottom: "12px", borderBottom: "1px solid rgba(0, 255, 204, 0.2)", paddingBottom: "6px" }}>{parseBold(trimmed.substring(2))}</h1>);
        } else if (trimmed !== "") {
          elements.push(<p key={index} style={{ marginBottom: "12px", lineHeight: "1.6" }}>{parseBold(trimmed)}</p>);
        }
      }
    });

    // Handle any trailing list
    if (inList) {
      elements.push(
        <ul key="list-end" style={{ margin: "10px 0 15px 20px" }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "6px" }}>{parseBold(item)}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className={`prepare-notes-container ${isModal ? "modal-view" : ""}`}>
      {/* Header */}
      {!isModal && (
        <header className="prepare-notes-header">
          <div className="logo-text" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            AI.ASSIST
          </div>
          <button
            className="back-home-btn"
            onClick={() => navigate("/")}
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
              gap: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Chat
          </button>
        </header>
      )}

      {/* Main Grid Content */}
      <main className="prepare-notes-content">
        {/* Left Side: Form Generator & Notes History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Note Config Panel */}
          <div className="glass-panel">
            <h2 className="panel-title">Prepare Study Notes</h2>
            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Syllabus / Topics</label>
                <textarea
                  className="form-textarea"
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  placeholder="Enter the syllabus topics or descriptions... (e.g. Newton's laws of motion, gravity)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <div className="difficulty-options">
                  <button
                    type="button"
                    className={`diff-btn easy ${difficulty === "easy" ? "active" : ""}`}
                    onClick={() => setDifficulty("easy")}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    className={`diff-btn medium ${difficulty === "medium" ? "active" : ""}`}
                    onClick={() => setDifficulty("medium")}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    className={`diff-btn hard ${difficulty === "hard" ? "active" : ""}`}
                    onClick={() => setDifficulty("hard")}
                  >
                    Hard
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Marks per Question</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="generate-btn" disabled={generating}>
                {generating ? (
                  <>
                    <div className="button-spinner"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Generate Notes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="glass-panel">
            <h2 className="panel-title" style={{ fontSize: "20px" }}>Saved Notes History</h2>
            {notesList.length === 0 ? (
              <p style={{ color: "rgba(255, 255, 255, 0.4)", margin: 0, fontSize: "14px" }}>
                No study notes prepared yet.
              </p>
            ) : (
              <div className="notes-history-section">
                {notesList.map((note) => (
                  <div
                    key={note._id}
                    className={`note-history-card ${selectedNoteId === note._id ? "active" : ""}`}
                    onClick={() => setSelectedNoteId(note._id)}
                  >
                    <div className="note-info">
                      <div className="note-title-text">{note.title}</div>
                      <div className="note-meta-row">
                        <span className={`note-tag ${note.difficulty}`}>{note.difficulty}</span>
                        <span className="note-date">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-note-btn"
                      onClick={(e) => handleDelete(note._id, e)}
                      title="Delete Note"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Note Display Area */}
        <div className="glass-panel note-display-wrapper" id="note-print-area">
          {activeNote ? (
            <>
              <div className="note-display-header">
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div className="note-meta-row">
                    <span className={`note-tag ${activeNote.difficulty}`}>{activeNote.difficulty}</span>
                    <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                      ({activeNote.marks} Marks per Question)
                    </span>
                  </div>
                </div>
                <div className="export-actions">
                  <button className="pdf-btn" onClick={handlePrint}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export as PDF
                  </button>
                </div>
              </div>

              <div className="note-body">{parseMarkdown(activeNote.content)}</div>
            </>
          ) : (
            <div className="placeholder-body">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "15px" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <h3>No Note Selected</h3>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>
                Select a note from history or generate a new study guide on the left side to get started.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PrepareNotes;
