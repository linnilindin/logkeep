import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/asyncHandler';
import { parseWith } from '../middleware/validate';
import {
  createMediaItem,
  deleteMediaItem,
  listMediaItems,
  updateMediaItem,
  updateMediaProgress,
} from '../services/media.service';
import { MEDIA_TYPES, PERSISTED_STATUSES } from '../types';

const statusSchema = z.enum(PERSISTED_STATUSES);
const typeSchema = z.enum(MEDIA_TYPES);
const idSchema = z.coerce.number().int().positive();

const listQuerySchema = z.object({
  status: statusSchema.optional(),
});

const createSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().optional(),
  type: typeSchema,
  tags: z.array(z.string()).default([]),
  current_value: z.number().int().min(0).optional(),
  is_ongoing: z.boolean(),
  status: statusSchema,
  cover_image_url: z.string().nullable().optional(),
  completed_chapters: z.number().int().positive().nullable().optional(),
  is_favourite: z.boolean().optional(),
  date_started: z.string().nullable().optional(),
  date_completed: z.string().nullable().optional(),
  last_updated_at: z.string().nullable().optional(),
});

const updateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    author: z.string().trim().optional(),
    type: typeSchema.optional(),
    tags: z.array(z.string()).optional(),
    current_value: z.number().int().min(0).optional(),
    is_ongoing: z.boolean().optional(),
    status: statusSchema.optional(),
    cover_image_url: z.string().nullable().optional(),
    completed_chapters: z.number().int().positive().nullable().optional(),
    is_favourite: z.boolean().optional(),
    date_started: z.string().nullable().optional(),
    date_completed: z.string().nullable().optional(),
    last_updated_at: z.string().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

const progressSchema = z.object({
  current_value: z.number().int().min(0),
});

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status } = parseWith(listQuerySchema, req.query);
    res.json(await listMediaItems(status, req.userId));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parseWith(createSchema, req.body);
    res.status(201).json(await createMediaItem(input, req.userId));
  })
);

router.patch(
  '/:id/progress',
  asyncHandler(async (req, res) => {
    const id = parseWith(idSchema, req.params.id);
    const { current_value } = parseWith(progressSchema, req.body);
    res.json(await updateMediaProgress(id, current_value, req.userId));
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseWith(idSchema, req.params.id);
    const updates = parseWith(updateSchema, req.body);
    res.json(await updateMediaItem(id, updates, req.userId));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseWith(idSchema, req.params.id);
    await deleteMediaItem(id, req.userId);
    res.json({ success: true });
  })
);

export default router;
