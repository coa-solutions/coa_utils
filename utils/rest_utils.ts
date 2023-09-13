import { Status } from "https://deno.land/std@0.182.0/http/http_status.ts";

export async function validateAndGetBody(req: Request): Promise<any> {
  validateRequestMethod(req);
  validateContentType(req);

  const body = await req.text();

  return body;
}

export function respondWithStatus(status: number, message?: string): Response {
  return new Response(message || Status[status].toString(), { status });
}

function validateRequestMethod(req: Request): void {
  if (req.method !== "POST") {
    throw respondWithStatus(Status.MethodNotAllowed);
  }
}

function validateContentType(req: Request): void {
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw respondWithStatus(Status.UnsupportedMediaType);
  }
}

export function parsePayload(body: string): any {
  try {
    const payload = JSON.parse(body);
    if (!payload) {
      throw new Error("Payload is empty");
    }
    return payload;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw respondWithStatus(Status.BadRequest, "Malformed JSON");
    }
    throw e; // Rethrow other unexpected errors
  }
}
