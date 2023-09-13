import { Status } from "https://deno.land/std@0.182.0/http/http_status.ts";

export async function verifyWebhook(
  req: Request,
  body: string,
  config: { secret: string; header: string; algorithm: string },
): Promise<void | Response> {
  try {
    let signatureHeader = req.headers.get(config.header);
    if (signatureHeader === null) {
      throw new Error("Signature header missing");
    }

    // Standardize header removal
    const match = signatureHeader.match(/^sha[1-9]+[0-9]*=(.*)/i);
    if (match) {
      signatureHeader = match[1];
    }

    // Move the verification code here
    const secretKeyEncoded = new TextEncoder().encode(config.secret);

    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyEncoded,
      { name: "HMAC", hash: config.algorithm },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(body),
    );

    const hexSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hexSignature !== signatureHeader) {
      throw new Error("Unauthorized");
    }
  } catch (e) {
    console.error("Failed to verify webhook:", e);
    return new Response("Unauthorized", { status: Status.Unauthorized });
  }
}
