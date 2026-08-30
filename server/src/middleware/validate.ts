import { ZodError, type ZodType } from 'zod';
import { badRequest } from '../lib/httpError';

export function parseWith<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw badRequest(formatIssues(error));
    }
    throw error;
  }
}

function formatIssues(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map(String).join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
}
