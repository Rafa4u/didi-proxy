import Cors from 'cors';
import fetch from 'node-fetch';

const cors = Cors({ origin: true });

function runCors(req, res) {
  return new Promise((resolve, reject) => {
    cors(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function handler(req, res) {
  await runCors(req, res);
  try {
    const response = await fetch("https://rafahotmail.app.n8n.cloud/webhook/didi", {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ erro: "Proxy falhou", detalhe: err.message });
  }
}