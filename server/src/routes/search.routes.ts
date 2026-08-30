import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/asyncHandler';
import { parseWith } from '../middleware/validate';
import { searchMedia } from '../services/search.service';
import { MEDIA_TYPES } from '../types';

const searchQuerySchema = z.object({
  q: z.string().default(''),
  // An unrecognised type falls back to searching every source.
  type: z.enum(MEDIA_TYPES).catch('other'),
});

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, type } = parseWith(searchQuerySchema, req.query);
    res.json(await searchMedia(q, type));
  })
);

export default router;
