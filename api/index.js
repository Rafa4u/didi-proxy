export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ status: "Proxy ativo 💬" });
  }

  if (req.method === "POST") {
    try {
      // Log de entrada
      console.log("[proxy] incoming headers:", req.headers);

      let body = req.body || {};
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { /* ignore */ }
      }
      console.log("[proxy] incoming body:", body);

      const forwarded = {
        ...body,
        message: body.message ?? body.mensagem,
        source: body.source ?? "webchat",
        ts: body.timestamp ?? new Date().toISOString()
      };

      const target = "https://workflows-mvp.agent-ai.com.br/webhook/livechat"; // PROD
      console.log("[proxy] forwarding to:", target, "payload:", forwarded);

      const upstream = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forwarded),
      });

      const ct = upstream.headers.get("content-type") || "";
      console.log("[proxy] upstream status:", upstream.status, "content-type:", ct);

      if (ct.includes("application/json")) {
        const json = await upstream.json();
        console.log("[proxy] upstream json:", json);
        return res.status(upstream.status).json(json);
      } else {
        const text = await upstream.text();
        console.log("[proxy] upstream text:", text);
        return res.status(upstream.status).json({ resposta: text });
      }
    } catch (e) {
      console.error("[proxy] erro:", e);
      return res.status(502).json({ error: "Bad Gateway", detail: String(e?.message || e) });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
