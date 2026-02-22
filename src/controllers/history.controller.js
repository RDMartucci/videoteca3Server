import { saveProgress, getContinueWatching } from '../services/history.service.js';

export const saveHistory = (req, res) => {
  saveProgress(req.body);
  res.json({ ok: true });
};

export const getHistory = (req, res) => {
  const data = getContinueWatching();
  res.json(data);
};
