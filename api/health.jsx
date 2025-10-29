export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const url = process.env.AGENT_URL;
  if (!url) {
    return res.status(500).json({ ok: false, error: 'AGENT_URL manquant (env)' });
  }

  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': process.env.AGENT_KEY || ''
      }
    });

    const data =
      (await r.clone().json().catch(async () => null)) ??
      { raw: await r.text() };

    return res.status(200).json({
      ok: true,
      upstreamStatus: r.status,
      data
    });
  } catch (e) {
    return res.status(502).json({
      ok: false,
      error: 'Upstream unreachable',
      detail: String(e)
    });
  }
}
