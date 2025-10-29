import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRCodeGenerator from "./pages/QRCodeGenerator/QRCodeGenerator";
import CreateSheet from "./pages/CreateSheet/CreateSheet";
import Layout from "./components/layout/layout";
import  AgentIA  from "./pages/agentIA/agentIA";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QRCodeGenerator />} />
          <Route path="create" element={<CreateSheet />} />
          <Route path="agentIA" element={<AgentIA />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
