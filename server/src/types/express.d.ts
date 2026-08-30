declare global {
  namespace Express {
    interface Request {
      // Supabase auth.users UUID. Populated by the auth middleware in Phase 2.
      userId?: string;
    }
  }
}

export {};
