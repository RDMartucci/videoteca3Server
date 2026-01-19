import { getSystemStatus } from '../services/health.service.js';

export const getStatus = async (req, res) => {
    try {
        const health = await getSystemStatus();
        res.json(health);
    } catch (error) {
        res.status(500).json({ error: "Error al verificar estado de discos" });
    }
};