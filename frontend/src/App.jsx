import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Customize from "./pages/Customize";
import AssistantName from "./pages/AssistantName";
import Home from "./pages/Home";
import { userDatacontext } from "./context/UserContext.jsx";

function App() {
  const { userdata, loading } = useContext(userDatacontext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default Route / Home Page */}
      <Route path="/" element={userdata ? <Home /> : <Navigate to="/signup" replace />} />

      {/* Customize Page */}
      <Route path="/customize" element={userdata ? <Customize /> : <Navigate to="/signup" replace />} />

      {/* Assistant Name Page */}
      <Route path="/assistant-name" element={userdata ? <AssistantName /> : <Navigate to="/signup" replace />} />

      {/* Signup Page */}
      <Route path="/signup" element={!userdata ? <Signup /> : <Navigate to="/customize" replace />} />

      {/* Signin Page */}
      <Route path="/signin" element={!userdata ? <Signin /> : <Navigate to="/" replace />} />

      {/* Redirect Any Unknown Route */}
      <Route
        path="*"
        element={userdata ? <Navigate to="/" replace /> : <Navigate to="/signup" replace />}
      />
    </Routes>
  );
}

export default App;