import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// Fonction pour imprimer l'élément référencé
export const printElement = (ref) => {
  if (!ref.current) return;

  const clone = ref.current.cloneNode(true);
  const canvases = clone.querySelectorAll("canvas");
  
  canvases.forEach((canvas) => {
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.style.width = "100px";
    img.style.height = "100px";
    img.style.display = "block";
    img.style.margin = "0 auto";
    canvas.replaceWith(img);
  });

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>QR Codes</title>
        <style>
          body {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }
          .qr-item {
            text-align: center;
            width: 120px;
            page-break-inside: avoid;
          }
          .qr-name {
            margin-top: 5px;
            font-size: 11px;
            word-break: break-word;
          }
          @media print {
            body { gap: 10px; }
            .qr-item { margin: 8px; }
          }
        </style>
      </head>
      <body>${clone.innerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

// Service de raccourcissement d'URL
const shortenUrl = async (url) => {
  try {
    // Solution 1: Service TinyURL (gratuit et simple)
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) throw new Error("Erreur TinyURL");
    
    const shortUrl = await response.text();
    
    // Vérifier que l'URL a bien été raccourcie
    if (shortUrl && shortUrl.startsWith('http') && shortUrl.length < url.length) {
      console.log(`✅ URL raccourcie: ${url.length} → ${shortUrl.length} caractères`);
      return shortUrl;
    } else {
      throw new Error("Raccourcissement échoué");
    }
  } catch (error) {
    console.warn("Échec raccourcissement, utilisation de l'URL originale:", error);
    
    // Solution 2: Raccourcissement manuel pour Google Sheets
    const googleSheetsMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)(?:\/edit|$)/);
    if (googleSheetsMatch) {
      const sheetId = googleSheetsMatch[1];
      const manualShortUrl = `https://sheets.gle/${sheetId}`;
      console.log(`🔧 URL manuelle: ${manualShortUrl}`);
      return manualShortUrl;
    }
    
    // Solution 3: Tronquer l'URL si trop longue
    if (url.length > 50) {
      return url.substring(0, 47) + '...';
    }
    
    return url;
  }
};

const QRCodeGenerator = () => {
  const [input, setInput] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortening, setShortening] = useState(false);
  const printRef = useRef();

  // 🔹 Appel Apps Script pour récupérer les liens
  const fetchSheets = async (numbersString) => {
    setLoading(true);
    setError("");
    try {
      console.log("📡 Envoi de la requête...");

      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbypp5ZxwEp-KqbHBqCuumiPuhIrzRL6u0_ITzW4jeIKMS6tofNuYhPWcaYMPPk-ZGyk/exec?numbersParam=${encodeURIComponent(
          numbersString
        )}&mode=get`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("📩 Réponse reçue:", data);

      if (!data.success) {
        throw new Error(data.error || "Erreur depuis Apps Script");
      }

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error("Aucune donnée retournée");
      }

      return data.data;
    } catch (err) {
      console.error("❌ Erreur fetchSheets:", err);
      setError(`Erreur: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Raccourcir toutes les URLs
  const shortenAllUrls = async (data) => {
    setShortening(true);
    try {
      console.log("🔗 Début du raccourcissement des URLs...");
      
      const shortenedData = await Promise.all(
        data.map(async (item, index) => {
          try {
            console.log(`📝 Raccourcissement ${index + 1}/${data.length}: ${item.url.substring(0, 50)}...`);
            const shortUrl = await shortenUrl(item.url);
            
            return {
              ...item,
              shortUrl: shortUrl,
              originalLength: item.url.length,
              shortLength: shortUrl.length
            };
          } catch (itemError) {
            console.warn(`⚠️ Erreur sur l'item ${index}:`, itemError);
            return {
              ...item,
              shortUrl: item.url, // Fallback vers l'URL originale
              originalLength: item.url.length,
              shortLength: item.url.length,
              error: true
            };
          }
        })
      );
      
      console.log("✅ Raccourcissement terminé:", shortenedData);
      return shortenedData;
    } catch (error) {
      console.error("❌ Erreur lors du raccourcissement:", error);
      return data.map(item => ({
        ...item,
        shortUrl: item.url,
        originalLength: item.url.length,
        shortLength: item.url.length
      }));
    } finally {
      setShortening(false);
    }
  };

  // 🔹 Génération des QR Codes
  const generateQRCodes = async () => {
    if (!input.trim()) {
      setError("Veuillez entrer des numéros (ex: 1-5;10;15-20)");
      return;
    }

    setError("");
    setQrCodes([]);

    const numbersString = input.trim();
    console.log("🎯 Génération pour:", numbersString);

    // Étape 1: Récupérer les données
    const sheetsData = await fetchSheets(numbersString);
    
    if (sheetsData.length === 0) {
      setError("Aucune feuille trouvée pour ces numéros");
      return;
    }

    console.log("📊 Données récupérées:", sheetsData.length, "éléments");

    // Étape 2: Raccourcir les URLs
    const finalData = await shortenAllUrls(sheetsData);
    
    // Étape 3: Mettre à jour l'état
    setQrCodes(finalData);
    
    // Statistiques
    const totalReduction = finalData.reduce((sum, item) => sum + (item.originalLength - item.shortLength), 0);
    console.log(`📉 Réduction totale: ${totalReduction} caractères`);
  };

  // 🔹 Vider tous les QR Codes
  const clearQRCodes = () => {
    setQrCodes([]);
    setInput("");
    setError("");
  };

  // 🔹 Calculer la complexité du QR Code
  const getQRComplexity = (urlLength) => {
    if (urlLength <= 20) return { level: "Très simple", color: "green" };
    if (urlLength <= 40) return { level: "Simple", color: "blue" };
    if (urlLength <= 60) return { level: "Moyen", color: "orange" };
    return { level: "Complexe", color: "red" };
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Section de contrôle */}
      <div style={{
        width: "100%",
        maxWidth: "500px",
        padding: "25px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{ 
          color: "#1877f2", 
          marginBottom: "20px", 
          fontSize: "24px",
          fontWeight: "600"
        }}>
          Générateur de QR Codes
        </h1>

        <div style={{ 
          display: "flex", 
          gap: "10px", 
          flexWrap: "wrap", 
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "15px"
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: 1-10;20;30"
            style={{
              padding: "10px 12px",
              flex: "1",
              minWidth: "200px",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
            onKeyPress={(e) => e.key === 'Enter' && generateQRCodes()}
          />
          <button
            onClick={generateQRCodes}
            disabled={loading || shortening}
            style={{
              padding: "10px 20px",
              backgroundColor: (loading || shortening) ? "#6c757d" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: (loading || shortening) ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "📡 Récupération..." : 
             shortening ? "🔗 Raccourcissement..." : " Générer"}
          </button>
        </div>

        <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          Format: numéros simples (5), plages (1-10), séparés par des points-virgules
        </div>
      </div>

      {/* Messages d'état */}
      {loading && (
        <div style={{ 
          padding: "15px", 
          borderRadius: "6px",
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <div>⏳ Chargement des données depuis Google Sheets...</div>
        </div>
      )}
      
      {shortening && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#fff3cd", 
          borderRadius: "6px",
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <div>🔗 Raccourcissement des URLs en cours...</div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: "15px", 
          color: "#c62828",
          borderRadius: "6px",
          marginBottom: "15px",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Affichage des QR Codes */}
      {qrCodes.length > 0 && (
        <div style={{ width: "100%", textAlign: "center" }}>

          {/* Grille de QR Codes */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              maxWidth: "900px",
              margin: "0 auto",
              boxSizing: "border-box"
            }}
            ref={printRef}
          >
            {qrCodes.map((qr, idx) => {
              const complexity = getQRComplexity(qr.shortUrl.length);
              return (
                <div
                  key={idx}
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    width: "140px"
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
                  <div style={{ 
                    fontSize: "11px", 
                    marginTop: "8px", 
                    fontWeight: "600",
                    wordBreak: "break-word",
                    lineHeight: "1.3"
                  }}>
                    {qr.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            justifyContent: "center", 
            marginTop: "25px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={() => printElement(printRef)}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
            >
              🖨️ Imprimer les QR Codes
            </button>
            
            <button
              onClick={clearQRCodes}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#5a6268"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
            >
              🗑️ Tout effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
