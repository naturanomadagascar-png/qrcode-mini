import React, { useState } from "react";

function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://script.google.com/macros/s/AKfycb.../exec"; // ton URL Apps Script

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    // ajoute le message utilisateur dans le chat
    setMessages([...messages, { from: "user", text: input }]);
/*
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          fileId: input, // tu peux mettre ici un ID de fichier
          project: "Digitalisation-Mairie"
        })
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.success ? `✅ Fichier renommé : ${data.result}` : `❌ ${data.message}` }
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: "Erreur : " + err.message }]);
    } finally {
      setInput("");
      setLoading(false);
    }
      */
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2>Agent Drive IA 💼</h2>
      <div
      >
        {messages.map((m, i) => (
          <iframe
                src="https://chat.openai.com"
                title="ChatGPT"
                style={{ width: "100vw", height: "100vh", border: "none" }}
                />
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Entre un ID de fichier..."
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px"
          }}
        >
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}

export default Chat;
