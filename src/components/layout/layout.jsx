import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

const Layout = () => {
  const lampSize = 200;
  const lampCount = 10;
  const sidebarWidth = 250;

  // Calcul des dimensions pour les lampes sur toute la fenêtre
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const lamps = [];
  const gapX = windowWidth / lampCount;
  const gapY = windowHeight / (lampCount / 2);

  for (let i = 0; i < lampCount; i++) {
    const x = i * gapX;
    const y = (i % 2) * gapY + gapY / 4;
    lamps.push({
      left: x,
      top: y,
      rotate: Math.random() * 360 - 180,
      opacity: 0.15 + Math.random() * 0.1,
    });
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh",
      position: "relative"
    }}>
      {/* Sidebar - DOIT AVOIR zIndex ÉLEVÉ */}
      <div style={{ position: "relative", zIndex: 1000 }}>
        <Sidebar />
      </div>

      {/* Fond lampes - EN ARRIÈRE PLAN */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
          backgroundColor: "#F0F8FF"
        }}
      >
        {lamps.map((lamp, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: lamp.top,
              left: lamp.left,
              fontSize: lampSize,
              transform: `rotate(${lamp.rotate}deg)`,
              color: `rgba(173, 216, 230, ${lamp.opacity})`,
            }}
          >
            💡
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          
          position: "relative",
          minHeight: "100vh",
          padding: "200px",
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`,
          zIndex: 1
        }}
      >
        {/* Contenu centré horizontalement et verticalement */}
        <div style={{ 
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;