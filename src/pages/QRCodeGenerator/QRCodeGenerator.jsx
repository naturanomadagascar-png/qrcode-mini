// src/components/QRCodeGenerator.jsx
import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { printElement } from "../../utils/printElement";

// Service de raccourcissement simple (TinyURL)
// Retourne du texte brut (URL courte) ou fallback sur l'URL d'origine
async function shortenUrl(url) {
  try {
    const r = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );
    if (!r.ok) throw new Error("TinyURL HTTP error");
    const shortUrl = await r.text();
    if (shortUrl && shortUrl.startsWith("http") && shortUrl.length < url.length) {
      return shortUrl;
    }
    throw new Error("Invalid short url");
  } catch {
    // Fallback: si trop long, tronque (pour limiter la densité QR)
    if (url.length > 140) return url.slice(0, 137) + "...";
    return url;
  }
}

// Exemple d’appel Apps Script (à remplacer par ton URL)
async function fetchSheets(numbersString) {
  // 🔁 remplace par ton propre endpoint Apps Script
  const endpoint =
    "https://script.google.com/macros/s/AKfycbypp5ZxwEp-KqbHBqCuumiPuhIrzRL6u0_ITzW4jeIKMS6tofNuYhPWcaYMPPk-ZGyk/exec";

  const url = `${endpoint}?numbersParam=${encodeURIComponent(
    numbersString
  )}&mode=get`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`Erreur HTTP: ${r.status}`);
  const data = await r.json();
  if (!data.success) throw new Error(data.error || "Erreur Apps Script");
  if (!Array.isArray(data.data) || data.data.length === 0)
    throw new Error("Aucune donnée retournée");
  // data attendu: [{ name, url }, ...]
  return data.data;
}

function QRCodeGenerator() {
  const [input, setInput] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shortening, setShortening] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  const getQRComplexity = (len) => {
    if (len <= 20) return { label: "Très simple", color: "green" };
    if (len <= 40) return { label: "Simple", color: "blue" };
    if (len <= 60) return { label: "Moyen", color: "orange" };
    return { label: "Complexe", color: "red" };
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Veuillez entrer des numéros (ex: 1-5;10;15-20)");
      return;
    }
    setError("");
    setQrCodes([]);
    setLoading(true);
    try {
      const rows = await fetchSheets(input.trim());
      setShortening(true);
      const out = [];
      for (const item of rows) {
        const shortUrl = await shortenUrl(item.url);
        out.push({
          ...item,
          shortUrl,
          originalLength: item.url?.length || 0,
          shortLength: shortUrl?.length || 0,
        });
      }
      setQrCodes(out);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
      setShortening(false);
    }
  };

  const handlePrint = () => {
    // appelle la FONCTION utilitaire (pas un composant)
    printElement(printRef);
  };

  const handleClear = () => {
    setQrCodes([]);
    setInput("");
    setError("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: 20,
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 24,
          borderRadius: 12,
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ color: "#1877f2", marginBottom: 16, fontSize: 22 }}>
          Générateur de QR Codes
        </h1>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: 1-10;20;30"
            style={{
              padding: "10px 12px",
              flex: 1,
              minWidth: 220,
              borderRadius: 6,
              fontSize: 14,
              boxSizing: "border-box",
              border: "1px solid #ddd",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />

          <button
            onClick={handleGenerate}
            disabled={loading || shortening}
            style={{
              padding: "10px 20px",
              backgroundColor: loading || shortening ? "#6c757d" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: loading || shortening ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "📡 Récupération..." : shortening ? "🔗 Raccourcissement..." : "Générer"}
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Format: numéros simples (5), plages (1-10), séparés par des points-virgules
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            color: "#c62828",
            borderRadius: 6,
            marginBottom: 15,
            maxWidth: 520,
            textAlign: "center",
            background: "#fdecea",
            border: "1px solid #f5c2c0",
          }}
        >
          ❌ {error}
        </div>
      )}

      {qrCodes.length > 0 && (
        <>
          <div
            ref={printRef}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              maxWidth: 980,
            }}
          >
            {qrCodes.map((qr, idx) => {
              const complexity = getQRComplexity(qr.shortUrl.length);
              return (
                <div
                  key={`${qr.name}-${idx}`}
                  className="qr-item"
                  style={{
                    textAlign: "center",
                    padding: 12,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    width: 140,
                  }}
                >
                  <QRCodeCanvas
                    value={qr.shortUrl}
                    size={100}
                    level="L"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    marginSize={2}
                    minVersion={1}
                  />
                  <div
                    className="qr-name"
                    style={{
                      fontSize: 11,
                      marginTop: 8,
                      fontWeight: 600,
                      wordBreak: "break-word",
                      lineHeight: 1.3,
                    }}
                  >
                    {qr.name}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handlePrint}
              style={{
                padding: "12px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🖨️ Imprimer les QR Codes
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: "12px 20px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🗑️ Tout effacer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default QRCodeGenerator;
