import type { NextFunction, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { unauthorized } from '../lib/httpError';

const BEARER_PREFIX = 'Bearer ';

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  return token.length > 0 ? token : null;
}

// Verification goes through Supabase rather than decoding the JWT locally, so
// the API keeps working whether the project signs tokens with the legacy shared
// secret or a rotating asymmetric key.
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = readBearerToken(req);

  if (!token) {
    next(unauthorized('Authentication required'));
    return;
  }

  try {
    const { data, error } = await getSupabase().auth.getUser(token);

    if (error || !data.user) {
      next(unauthorized('Invalid or expired session'));
      return;
    }

    req.userId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
}
