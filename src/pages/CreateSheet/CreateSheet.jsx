import React, { useState } from "react";
import Modal from "../../components/modal/modal";

// 🔹 Composant principal
const CreateSheet = () => {
  const [startNumber, setStartNumber] = useState("");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbypp5ZxwEp-KqbHBqCuumiPuhIrzRL6u0_ITzW4jeIKMS6tofNuYhPWcaYMPPk-ZGyk/exec";

  const handleCreateSheets = async () => {
    if (!startNumber) {
      setModalContent(<div>⚠️ Veuillez entrer un numéro de départ.</div>);
      return;
    }

    setLoading(true);
    try {
      const url = `${SCRIPT_URL}?startNumber=${startNumber}&count=${count}&mode=create`;
      console.log("📡 Requête :", `${SCRIPT_URL}?startNumber=${startNumber}&count=${count}&mode=create`);

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        const createdList = (data.created || []).map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.name}
            </a>
          </li>
        ));

        const existsList = (data.exists || []).map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.name}
            </a>
          </li>
        ));

        const errorList = (data.errors || []).map((e) => (
          <li key={e.name}>
            <strong>{e.name}</strong> : {e.error}
          </li>
        ));

        setModalContent(
          <div style={{ textAlign: "left" }}>
            {createdList.length > 0 && (
              <>
                <h4 style={{ color: "green" }}>✅ Feuilles créées :</h4>
                <ul>{createdList}</ul>
              </>
            )}

            {existsList.length > 0 && (
              <>
                <h4 style={{ color: "#f39c12" }}>⚠️ Déjà existantes :</h4>
                <ul>{existsList}</ul>
              </>
            )}

            {errorList.length > 0 && (
              <>
                <h4 style={{ color: "red" }}>❌ Erreurs :</h4>
                <ul>{errorList}</ul>
              </>
            )}

            {createdList.length === 0 &&
              existsList.length === 0 &&
              errorList.length === 0 && (
                <div>Aucune feuille créée.</div>
              )}
          </div>
        );
      } else {
        setModalContent(<div>Erreur : {data.error}</div>);
      }
    } catch (err) {
      
      setModalContent(
        <div>Erreur réseau, vérifie ton Apps Script et sa publication.</div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<div
  style={{
    marginTop: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  }}
>
  <div
    style={{
      width: "400px",
      maxWidth: "90%",
      padding: "30px 25px",
      borderRadius: "15px",
      backgroundColor: "#fff",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      textAlign: "center",
    }}
  >
    <h1 style={{ color: "#1877f2", marginBottom: "25px" }}>
      Créer des Feuilles Google Sheets
    </h1>

    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontWeight: "500" }}>
        Numéro de départ :{" "}
        <input
          type="number"
          value={startNumber}
          onChange={(e) => setStartNumber(e.target.value)}
          placeholder="ex: 45"
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100px",
            textAlign: "center",
            marginLeft: "10px",
          }}
        />
      </label>
    </div>

    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontWeight: "500" }}>
        Nombre de feuilles à créer :{" "}
        <input
          type="number"
          value={count}
          min="1"
          onChange={(e) => setCount(Number(e.target.value))}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "60px",
            textAlign: "center",
            marginLeft: "10px",
          }}
        />
      </label>
    </div>

    <button
      onClick={handleCreateSheets}
      style={{
        padding: "12px 25px",
        backgroundColor: "#1877f2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
        transition: "all 0.2s ease",
      }}
      disabled={loading}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#145dbf")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1877f2")}
    >
      {loading ? "Création en cours..." : "Créer la(les) feuille(s)"}
    </button>

    <Modal
      show={!!modalContent}
      title="Résultat de la création"
      onClose={() => setModalContent(null)}
    >
      {modalContent}
    </Modal>
  </div>
</div>

  );
};

export default CreateSheet;
