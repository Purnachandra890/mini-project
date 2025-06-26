// import React from "react";
// import { useNavigate } from "react-router-dom";

// const NavbarLoggedOut = () => {
//   const navigate = useNavigate();

//   return (
//     <nav
//       style={{
//         backgroundColor: "black",
//         color: "white",
//         width: "100%",
//         position: "sticky",
//         top: 0,
//         zIndex: 50,
//         padding: "1rem 2rem",
//         display: "flex",
//         alignItems: "center",
//         fontFamily: "'Manrope', sans-serif",
//       }}
//     >
//       {/* Left 50% - Logo */}
//       <div
//         style={{
//           width: "50%",
//           fontWeight: "bold",
//           fontSize: "48px",
//           cursor: "pointer",
//         }}
//         onClick={() => navigate("/")}
//       >
//         GENIE-AI
//       </div>

//       {/* Right 50% - Navigation */}
//       <div
//         style={{
//           width: "50%",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           fontSize: "24px",
//         }}
//       >
//         <span style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>
//           Home
//         </span>
//         <span style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
//           Agents
//         </span>
//         <span style={{ cursor: "pointer" }} onClick={() => navigate("/how-it-works")}>
//           How it works
//         </span>
//         <button
//           onClick={() => navigate("/login")}
//           style={{
//             backgroundColor: "black",
//             color: "white",
//             border: "1px solid white",
//             padding: "6px 12px",
//             fontSize: "24px",
//             borderRadius: "32px",
//             width: "200px",
//             cursor: "pointer",
//           }}
//         >
//           Login
//         </button>
//         <button
//           onClick={() => navigate("/signup")}
//           style={{
//             backgroundColor: "black",
//             color: "white",
//             border: "1px solid white",
//             padding: "6px 12px",
//             fontSize: "24px",
//             borderRadius: "32px",
//             width: "200px",
//             cursor: "pointer",
//           }}
//         >
//           Sign up
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default NavbarLoggedOut;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NavbarLoggedOut = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMenuOpen(false);
  };

  const navLinkStyle = {
    cursor: "pointer",
    padding: "8px 0",
  };

  return (
    <nav
      style={{
        backgroundColor: "black",
        color: "white",
        width: "100%",
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "1rem 1.5rem",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {/* Top bar: Logo + Hamburger */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => handleNavigate("/")}
          style={{
            fontWeight: "bold",
            fontSize: "36px",
            cursor: "pointer",
          }}
        >
          GENIE-AI
        </div>

        {/* Hamburger icon for mobile */}
        {isMobile ? (
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              fontSize: "30px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {menuOpen ? "✖" : "☰"}
          </div>
        ) : (
          // Desktop Nav
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              marginLeft: "auto",
              fontSize: "20px",
            }}
          >
            <span style={navLinkStyle} onClick={() => handleNavigate("/")}>
              Home
            </span>
            <span style={navLinkStyle} onClick={() => handleNavigate("/login")}>
              Agents
            </span>
            <span style={navLinkStyle} onClick={() => handleNavigate("/how-it-works")}>
              How it works
            </span>
            <button
              onClick={() => handleNavigate("/login")}
              style={{
                backgroundColor: "black",
                color: "white",
                border: "1px solid white",
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "32px",
                width: "140px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              onClick={() => handleNavigate("/signup")}
              style={{
                backgroundColor: "black",
                color: "white",
                border: "1px solid white",
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "32px",
                width: "140px",
                cursor: "pointer",
              }}
            >
              Sign up
            </button>
          </div>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1rem",
            fontSize: "18px",
            marginTop: "1rem",
          }}
        >
          <span style={navLinkStyle} onClick={() => handleNavigate("/")}>
            Home
          </span>
          <span style={navLinkStyle} onClick={() => handleNavigate("/login")}>
            Agents
          </span>
          <span style={navLinkStyle} onClick={() => handleNavigate("/how-it-works")}>
            How it works
          </span>
          <button
            onClick={() => handleNavigate("/login")}
            style={{
              backgroundColor: "black",
              color: "white",
              border: "1px solid white",
              padding: "6px 12px",
              fontSize: "18px",
              borderRadius: "32px",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <button
            onClick={() => handleNavigate("/signup")}
            style={{
              backgroundColor: "black",
              color: "white",
              border: "1px solid white",
              padding: "6px 12px",
              fontSize: "18px",
              borderRadius: "32px",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Sign up
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavbarLoggedOut;
