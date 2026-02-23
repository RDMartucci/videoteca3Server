import { buildIndex } from '../services/indexer.service.js';

export const runIndex = async (req, res) => {
  try {
    await buildIndex();
    res.json({ ok: true, message: "Indexación completada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error indexando librería" });
  }
};