export default async function handler(req, res) {
  // CORS básico
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ status: "Proxy ativo 💬" });
  }

  if (req.method === "POST") {
    try {
      // em Vercel Node 18, fetch é global
      const body = req.body || {};
      const forwarded = {
        ...body,
        // aceita 'mensagem' (do seu front antigo) e padroniza como 'message'
        message: body.message ?? body.mensagem
      };

      const upstream = await fetch("https://workflows-mvp.agent-ai.com.br/webhook-test/livechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forwarded)
      });

      const ct = upstream.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await upstream.json();
        return res.status(upstream.status).json(json);
      } else {
        const text = await upstream.text();
        // devolve como JSON compatível com seu front
        return res.status(upstream.status).json({ resposta: text });
      }
    } catch (e) {
      console.error("[proxy] erro", e);
      return res.status(502).json({ error: "Bad Gateway" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
