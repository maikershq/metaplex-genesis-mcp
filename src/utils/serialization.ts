export function serializeBigInts(obj: unknown): unknown {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }
  return obj;
}

export function formatResponse(address: string, data: unknown): string {
  const serialized = serializeBigInts(data) as Record<string, unknown>;
  return JSON.stringify({ address, ...serialized }, null, 2);
}

export function jsonResponse(data: unknown): string {
  return JSON.stringify(serializeBigInts(data), null, 2);
}
