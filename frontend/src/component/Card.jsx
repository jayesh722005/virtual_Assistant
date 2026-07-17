import React from "react";
import "../Css/Card.css";

function Card({ image, title, onClick, isSelected }) {
  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{ 
        cursor: "pointer", 
        border: isSelected ? "3px solid #00ffcc" : "none",
        boxSizing: "border-box"
      }}
    >
      <img src={image} alt={title} />
    </div>
  );
}

export default Card;