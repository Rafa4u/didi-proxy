import Cors from 'cors';
import fetch from 'node-fetch';

// Inicializa CORS
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

  // Rota GET para teste
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Proxy ativo 💬' });
  }

  // POST para enviar ao n8n
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://rafahotmail.app.n8n.cloud/webhook/didi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      return res.status(200).json(data);
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
