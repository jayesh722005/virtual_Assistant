import React, { useContext, useState } from "react";
import "../Css/Signup.css";
import { userDatacontext } from "../context/UserContext";
import bg from "../assets/bg.jpeg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const { ServerURL, userdata, setUserdata } = useContext(userDatacontext);
  const navigate = useNavigate();

  // State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Signup Function
  const handlesignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Clear old messages
    setError("");
    setSuccess("");

    try {
      const result = await axios.post(
        `${ServerURL}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      setLoading(false)
      setUserdata(result.data.user || result.data)
      setSuccess(result.data.message || "Account created successfully!");
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      // Redirect
      navigate("/customize")
    } catch (error) {
      console.log(error);
      setUserdata(null)
      setLoading(false);
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div
      className="signup-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="overlay"></div>

      <div className="signup-box">
        <h1>Create Account</h1>
        <p>Sign up to get started</p>

        <form onSubmit={handlesignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Success Message */}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="bottom-text">
          Already have an account? <span style={{ cursor: "pointer", color: "#00ffcc" }} onClick={() => navigate("/signin")}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;