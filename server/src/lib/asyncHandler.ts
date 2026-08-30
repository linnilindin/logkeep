import type { NextFunction, Request, RequestHandler, Response } from 'express';

// Express 5 forwards rejected promises on its own, but wrapping keeps the
// behaviour explicit and stable if the major version changes.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
