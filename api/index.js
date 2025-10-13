if (req.method === "POST") {
  try {
    // garante que o body seja objeto mesmo se vier string
    let body = req.body || {};
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch {}
    }

    const forwarded = {
      ...body,
      message: body.message ?? body.mensagem
    };

    const upstream = await fetch("https://workflows-mvp.agent-ai.com.br/webhook/livechat", { // ou .../webhook-test/livechat no modo teste
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
      return res.status(upstream.status).json({ resposta: text });
    }
  } catch (e) {
    console.error("[proxy] erro", e);
    return res.status(502).json({ error: "Bad Gateway" });
  }
}
