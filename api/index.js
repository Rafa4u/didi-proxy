import Cors from 'cors';
import fetch from 'node-fetch';

// Inicializa o middleware CORS com origem dinâmica
const cors = Cors({ origin: true });

function runCors(req, res) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runCors(req, res);

  // Cabeçalhos de CORS manualmente definidos
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou especifique: "https://www.agent-ai.com.br"
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde imediatamente a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rota GET para teste
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Proxy ativo 💬' });
  }

  // Rota POST: proxy para o webhook do n8n
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://workflows-mvp.agent-ai.com.br/webhook-test/livechat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();

      try {
        const json = JSON.parse(text);
        return res.status(200).json(json);
      } catch (e) {
        return res.status(200).json({ resposta: text });
      }

    } catch (error) {
      console.error("Erro ao conectar com o n8n:", error);
      return res.status(500).json({
        error: 'Erro ao conectar com o Didi (n8n)',
        detalhes: error.message || 'Erro desconhecido',
      });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
}
