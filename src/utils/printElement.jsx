// src/utils/printElement.js
export const printElement = (ref) => {
  if (!ref?.current) {
    alert("⚠️ Aucun contenu à imprimer !");
    return;
  }

  // Clone le contenu actuel
  const clone = ref.current.cloneNode(true);

  // Convertir tous les <canvas> en <img> pour impression
  const canvases = ref.current.querySelectorAll("canvas");
  const clonesCanvases = clone.querySelectorAll("canvas");

  canvases.forEach((canvas, i) => {
    try {
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.style.width = `${canvas.width}px`;
      img.style.height = `${canvas.height}px`;
      img.style.display = "block";
      img.style.margin = "0 auto";
      clonesCanvases[i].replaceWith(img);
    } catch (err) {
      console.warn("Canvas non convertible :", err);
      const placeholder = document.createElement("div");
      placeholder.textContent = "[QR non disponible]";
      placeholder.style.width = "100px";
      placeholder.style.height = "100px";
      placeholder.style.border = "1px solid #ccc";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      clonesCanvases[i].replaceWith(placeholder);
    }
  });

  // Crée une div temporaire pour l’impression
  const printArea = document.createElement("div");
  printArea.id = "print-area";
  printArea.style.position = "fixed";
  printArea.style.top = "0";
  printArea.style.left = "0";
  printArea.style.width = "100vw";
  printArea.style.height = "100vh";
  printArea.style.background = "white";
  printArea.style.zIndex = "9999";
  printArea.style.overflow = "auto";

  printArea.innerHTML = `
    <style>
      @media print {
        body * { visibility: hidden !important; }
        #print-area, #print-area * { visibility: visible !important; }
        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
      }
      #print-root {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
        font-family: Arial, sans-serif;
        padding: 20px;
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
    </style>
    <div id="print-root">${clone.innerHTML}</div>
  `;

  document.body.appendChild(printArea);

  // Délai pour s'assurer que les images sont chargées avant impression
  setTimeout(() => {
    window.print();

    // Nettoyage après impression
    setTimeout(() => {
      document.body.removeChild(printArea);
    }, 500);
  }, 500);
};
