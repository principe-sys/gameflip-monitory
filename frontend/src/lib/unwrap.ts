export type ApiEnvelope<T> = { status?: string; data?: T; count?: number; error?: string; message?: string };

export function unwrap<T>(input: unknown): T {
  if (input && typeof input === 'object' && 'data' in (input as any)) {
    return (input as any).data as T;
  }
  return input as T;
}
