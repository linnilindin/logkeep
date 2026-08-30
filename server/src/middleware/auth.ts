import type { NextFunction, Request, Response } from 'express';

// Phase 1: pass-through. Phase 2 verifies the Supabase JWT from the
// Authorization header and sets req.userId, which the media service already
// threads into every query.
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.userId = undefined;
  next();
}
