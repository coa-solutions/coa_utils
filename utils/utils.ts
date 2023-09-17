// utils.ts
import { load } from "https://deno.land/std/dotenv/mod.ts";

/**
 * Validate and get environment variables.
 *
 * @example
 * const { SLACK_BOT_TOKEN } = await validateAndGetEnvVars(["SLACK_BOT_TOKEN"]);
 *
 * @param variables - The list of environment variables to validate and fetch.
 * @param allowMissing - Optional list of variables that are allowed to be missing.
 * @returns A Promise resolving to a Record containing the environment variables.
 */
export async function validateAndGetEnvVars(
  variables: string[],
  allowMissing: string[] = [],
): Promise<Record<string, string>> {
  const ENV = Deno.env.get("ENV") || "dev";
  const CI = Deno.env.get("CI");
  let finalEnv: Record<string, string | undefined>;

  if (ENV === "prod" || CI === "true") {
    finalEnv = Deno.env.toObject();
  } else {
    // Load .env file from root directory
    finalEnv = await load({ envPath: "./.env" });
  }

  const envVars: Record<string, string> = {};

  for (const variable of variables) {
    if (!finalEnv[variable] && !allowMissing.includes(variable)) {
      throw new Error(
        `${variable} must be set in environment variables. Current ENV: ${ENV}\n` +
          `Example: const { ${variable} } = await validateAndGetEnvVars(["${variable}"]);`,
      );
    }

    if (
      finalEnv[variable] ||
      (finalEnv[variable] === "" && !allowMissing.includes(variable))
    ) {
      envVars[variable] = finalEnv[variable] as string;
    }
  }

  return envVars;
}

/// This function knows to much, it should not need teh request object
import { Status } from "https://deno.land/std@0.182.0/http/http_status.ts";
//
export async function verifyWebhookPayload(
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
