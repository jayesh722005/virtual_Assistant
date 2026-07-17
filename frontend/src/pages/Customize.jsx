import React, { useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../component/Card.jsx";
import { userDatacontext } from "../context/UserContext.jsx";

import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import image8 from "../assets/image8.jpg";
import image3 from "../assets/bg.jpeg"

import "../Css/Customize.css";

function Customize() {
  const { frontend, setfrontend, backend, setbackend, setAssistantVoice } =
    useContext(userDatacontext);

  const inputImage = useRef();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!frontend) {
      alert("Please select or upload an assistance image first!");
      return;
    }
    navigate("/assistant-name");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setbackend(file);
    setfrontend(URL.createObjectURL(file));
  };

  const cards = [
    { image: image1, title: "Assistant 1", gender: "female" },
    { image: image2, title: "Assistant 2", gender: "female" },
    { image: image4, title: "Assistant 3", gender: "male" },
    { image: image8, title: "Assistant 8", gender: "male" },
    { image: image5, title: "Assistant 4", gender: "female" },
    { image: image6, title: "Assistant 5", gender: "female" },
    { image: image7, title: "Assistant 6", gender: "female" },
    { image: image3, title: "Assistant 7", gender: "female" },
  ];

  return (
    <div className="customize">
      {/* Back Button */}
      <div className="back-btn" onClick={() => navigate("/")}>
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

      <div className="customize-content">
        <h1 className="customize-title">
          Select Your Assistance Image
        </h1>

        <div className="container">
          {cards.map((card, index) => (
            <Card
              key={index}
              image={card.image}
              title={card.title}
              isSelected={frontend === card.image}
              onClick={() => {
                setfrontend(card.image);
                setbackend(null);
                setAssistantVoice(card.gender);
              }}
            />
          ))}

          {/* Upload Card */}
          <div
            className="card upload-card"
            onClick={() => inputImage.current.click()}
            style={{ 
              border: backend ? "3px solid #00ffcc" : "2px solid rgba(255, 255, 255, 0.2)",
              boxSizing: "border-box"
            }}
          >
            {backend ? (
              <img
                src={frontend}
                alt="Uploaded Assistant"
                className="upload-preview"
              />
            ) : (
              <>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>

                <span>Upload</span>
              </>
            )}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />

        <div className="button-container">
          <button className="next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Customize;