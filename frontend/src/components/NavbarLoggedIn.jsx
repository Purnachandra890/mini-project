// import React from "react";
// import { useNavigate } from "react-router-dom";

// const NavbarLoggedIn = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // Clear the token from localStorage
//     localStorage.removeItem("Authorization"); // Assuming you stored it as "token"

//     // Navigate to the landing page
//     navigate("/");
    
//     // Optionally reload to reset any UI (if you aren't using context)
//     window.location.reload(); // <- remove this if using context to track login state
//   };

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
//         <span style={{ cursor: "pointer" }} onClick={() => navigate("/agents")}>
//           Agents
//         </span>
//         <span style={{ cursor: "pointer" }} onClick={() => navigate("/how-it-works")}>
//           How it works
//         </span>
//         <span style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>
//           Profile
//         </span>
//         <button
//           onClick={handleLogout}
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
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default NavbarLoggedIn;



import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NavbarLoggedIn = () => {
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

  const handleLogout = () => {
    localStorage.removeItem("Authorization");
    navigate("/");
    window.location.reload();
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMenuOpen(false); // Close menu on mobile after click
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
      {/* Top bar */}
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
          onClick={() => handleNavigate("/home")}
          style={{
            fontWeight: "bold",
            fontSize: "36px",
            cursor: "pointer",
          }}
        >
          GENIE-AI
        </div>

        {/* Hamburger (only mobile) */}
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
          // Desktop menu
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              marginLeft: "auto",
              fontSize: "20px",
            }}
          >
            <span style={navLinkStyle} onClick={() => handleNavigate("/home")}>
              Home
            </span>
            <span style={navLinkStyle} onClick={() => handleNavigate("/agents")}>
              Agents
            </span>
            <span style={navLinkStyle} onClick={() => handleNavigate("/how-it-works")}>
              How it works
            </span>
            <span style={navLinkStyle} onClick={() => handleNavigate("/profile")}>
              Profile
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "black",
                color: "white",
                border: "1px solid white",
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "32px",
                width: "200px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1rem",
            fontSize: "20px",
            marginTop: "1rem",
          }}
        >
          <span style={navLinkStyle} onClick={() => handleNavigate("/home")}>
            Home
          </span>
          <span style={navLinkStyle} onClick={() => handleNavigate("/agents")}>
            Agents
          </span>
          <span style={navLinkStyle} onClick={() => handleNavigate("/how-it-works")}>
            How it works
          </span>
          <span style={navLinkStyle} onClick={() => handleNavigate("/profile")}>
            Profile
          </span>
          <button
            onClick={() => {
              handleLogout();
              if (isMobile) setMenuOpen(false); // Close menu after logout too
            }}
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
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavbarLoggedIn;
