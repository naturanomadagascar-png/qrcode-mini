import { useState } from "react";

export default function AgentIA() {
  const [out, setOut] = useState(null);
  const url =
    "https://script.google.com/macros/s/AKfycbzj0A6gJAKmsgpqJIguOMReum7vTpJT6dnDAK9Zp4OfgSkA_Tmh-f-cBgkkwI3uqvWr/exec";

  const ping = async () => {
    try {
      const r = await fetch(url, { headers: { accept: "application/json" } });
      const text = await r.text();            // toujours lisible
      let data;
      try {
        data = JSON.parse(text);              // tente JSON
      } catch {
        data = { raw: text };                 // sinon renvoie brut
      }
      setOut(data);
    } catch (e) {
      setOut({ ok: false, error: String(e) });
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <button onClick={ping}>Ping Drive (doGet)</button>
      <pre>{JSON.stringify(out, null, 2)}</pre>
    </main>
  );
}
