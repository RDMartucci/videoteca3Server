import { getMetadata } from '../services/metadata.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMediaMetadata = asyncHandler(async (req, res) => {
  const media = await getMetadata(req.params.id);

  if (!media) {
    const error = new Error('Media no encontrada');
    error.status = 404;
    throw error;
  }

  const { path, ...safeMedia } = media;
  res.json({ success: true, media: safeMedia });
});
