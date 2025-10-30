export const config = { runtime: "edge" };

// ⚠️ Remplace l'URL ci-dessous par TON tunnel actuel si jamais il change.
const spec = {
  "openapi": "3.1.1",
  "info": {
    "title": "NATURANO React Agent",
    "version": "1.0.0",
    "description": "API de test de connectivité React/Vercel pour ChatGPT Actions."
  },
  "servers": [
    { "url": "https://tokyo-nations-lottery-progress.trycloudflare.com/" }
  ],
  "paths": {
    "/api/health": {
      "get": {
        "operationId": "pingReactApp",
        "summary": "Ping simple pour vérifier que l’application est en ligne",
        "description": "Retourne un indicateur d’état et le timestamp serveur.",
        "responses": {
          "200": {
            "description": "Réponse réussie avec statut de l’application",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "ok": { "type": "boolean", "description": "True si l’app répond" },
                    "service": { "type": "string", "description": "Nom du service/env" },
                    "ts": { "type": "integer", "format": "int64", "description": "UNIX ms" }
                  },
                  "required": ["ok", "service", "ts"],
                  "additionalProperties": false
                },
                "examples": {
                  "success": {
                    "value": { "ok": true, "service": "vite-dev", "ts": 1761734422261 }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {}
};

export default async function handler() {
  return new Response(JSON.stringify(spec), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
