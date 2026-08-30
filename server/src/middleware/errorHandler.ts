import type { ErrorRequestHandler, Request, Response } from 'express';
import { HttpError } from '../lib/httpError';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
};
