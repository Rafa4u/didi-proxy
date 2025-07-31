import Cors from 'cors';
import fetch from 'node-fetch';

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

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Proxy ativo 💬' });
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch('https://rafahotmail.app.n8n.cloud/webhook/didi1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao conectar com o Didi', detalhes: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
