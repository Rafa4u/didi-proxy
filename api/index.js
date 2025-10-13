export default async function handler(req, res) {
  // CORS básico
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Teste rápido do proxy
  if (req.method === "GET") {
    return res.status(200).json({ status: "Proxy ativo 💬" });
  }

  // POST: encaminha mensagem do chat ao n8n
  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const forwarded = {
        ...body,
        message: body.message ?? body.mensagem,
      };

      // 🔗 URL do webhook no n8n (produção)
      const target = "https://workflows-mvp.agent-ai.com.br/webhook/livechat";

      // Envia para o n8n
      const upstream = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forwarded),
      });

      // 🧠 Lê SEMPRE como texto e tenta converter
      const raw = await upstream.text();
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { reply: raw || "" };
      }

      // Retorna a resposta (mesmo se 4xx/5xx)
      return res.status(upstream.status).json(payload);

    } catch (e) {
      console.error("[proxy] erro", e);
      return res.status(502).json({
        error: "Bad Gateway",
        detail: e.message || "Erro desconhecido",
      });
    }
  }

  // Outros métodos não permitidos
  return res.status(405).json({ error: "Method Not Allowed" });
}
