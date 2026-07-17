import React, { useContext, useState } from "react";
import "../Css/Signup.css"
import { userDatacontext } from "../context/UserContext";
import bg from "../assets/bg.jpeg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signin() {
  const { ServerURL, userdata, setUserdata } = useContext(userDatacontext);
  const navigate = useNavigate();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Signin Function
  const handleSignin = async (e) => {
    e.preventDefault()
    setError("");
    setLoading(true)
    setSuccess("");

    try {
      const result = await axios.post(
        `${ServerURL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);
      setLoading(false)
      setSuccess(result.data.message || "Login Successful!");
      setUserdata(result.data.user || result.data);
      
      // Clear Form
      setEmail("");
      setPassword("");

      // Redirect
      navigate("/customize");

    } catch (error) {
      console.log(error);
      setLoading(false)
      setUserdata(null)
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
        <h1>Welcome Back</h1>
        <p>Sign in to continue</p>

        <form onSubmit={handleSignin}>
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
              "Sign In"
            )}
          </button>
        </form>

        <div className="bottom-text">
          Don't have an account? <span style={{ cursor: "pointer", color: "#00ffcc" }} onClick={() => navigate("/signup")}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}

export default Signin;