export default async function handler(req, res) {
  // pode vir via query ?token=..., ou via header Authorization
  let incoming = req.query.token || req.headers.authorization || '';
  incoming = Array.isArray(incoming) ? incoming[0] : incoming;

  // normaliza o header: se já começar com "Bearer ", mantém; se vier cru, prefixa
  const hasBearer = /^Bearer\s+/i.test(incoming);
  const authHeader = incoming
    ? (hasBearer ? incoming : `Bearer ${incoming.trim()}`)
    : null;

  try {
    const resp = await fetch('http://localhost:8000/api/profile/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}