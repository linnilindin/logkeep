import type { Request } from 'express';
import { unauthorized } from './httpError';

// Routes behind authMiddleware always have a user, but Express types it as
// optional. Reading it through here keeps the media service on a plain string
// so a query can never be built without a user scope.
export function requireUserId(req: Request): string {
  if (!req.userId) {
    throw unauthorized('Authentication required');
  }

  return req.userId;
}
