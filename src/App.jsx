import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRCodeGenerator from "./pages/QRCodeGenerator/QRCodeGenerator";
import CreateSheet from "./pages/CreateSheet/CreateSheet";
import Layout from "./components/layout/layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QRCodeGenerator />} />
          <Route path="create" element={<CreateSheet />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
