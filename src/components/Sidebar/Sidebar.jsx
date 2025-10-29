import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilePlus } from "react-icons/fi";
import { FaQrcode,FaRobot} from "react-icons/fa";
import "./Sidebar.css";

const MenuItem = ({ icon, label, expanded, onClick }) => (
  <div className="menu-item" onClick={onClick}>
    <span className="icon">{icon}</span>
    {expanded && <span className="menu-text">{label}</span>}
  </div>
);

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`sidebar ${expanded ? "expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="logo">{expanded ? "QR Code Generator" : "QR"}</div>

      <nav className="nav">
        <MenuItem
          icon={<FiFilePlus size={24} />}
          label="Créer une feuille"
          expanded={expanded}
          onClick={() => navigate("/create")}
        />
        <MenuItem
          icon={<FaQrcode size={24} />}
          label="Générer QR Code"
          expanded={expanded}
          onClick={() => navigate("/")}
        />
        <MenuItem
          icon={<FaRobot  size={24} />}
          label="Agent IA"
          expanded={expanded}
          onClick={() => navigate("/agentIA")}
        />
      </nav>
    </aside>
  );
}
