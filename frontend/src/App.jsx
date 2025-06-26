import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePublic from "./pages/HomePublic";
import HomePrivate from "./pages/HomePrivate";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Agents from "./pages/Agents";
import ScriptAgent from "./agents/ScriptAgent";
import HowItWorks from "./pages/HowItWorks"
import Profile from "./pages/Profile";
import CaptionAgent from "./agents/CaptionAgent";
import TranslateAgent from "./agents/TranslateAgent"

import NavbarLoggedIn from "./components/NavbarLoggedIn";
import NavbarLoggedOut from "./components/NavbarLoggedOut";


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("Authorization"); // Correct key
    setIsLoggedIn(token && token.startsWith("Bearer")); // Check for Bearer token
  }, []);

  return (
    <Router>
      {isLoggedIn ? <NavbarLoggedIn /> : <NavbarLoggedOut />}

      <Routes>
      {isLoggedIn ? <Route path="/home" element={<HomePrivate />} /> : <Route path="/" element={<HomePublic />} />}
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/script" element={<ScriptAgent />} />
        <Route path="/agents/caption" element={<CaptionAgent />} />
        <Route path="/agents/translate" element={<TranslateAgent />} />


        {/* Optional: Add this route if you have a profile page */}
        <Route path="/profile" element={<Profile />} />
        {/* Optional: Add this route if you have a How It Works page */}
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </Router>
  );
};

export default App;
