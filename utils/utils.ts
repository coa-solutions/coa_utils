// utils.ts
import { load } from "https://deno.land/std/dotenv/mod.ts";

const env = await load();
const ENV = Deno.env.get("ENV") || "dev"; // Fetch the ENV variable, default to 'dev' if not set

// Load from Deno.env if ENV is 'prod', otherwise load from .env file
const finalEnv = ENV === "prod" ? Deno.env.toObject() : env;

export function validateAndGetEnvVars(
  variables: string[],
  allowMissing: string[] = [], // Optional parameter to skip validation for certain variables
): Record<string, string> {
  const envVars: Record<string, string> = {};

  for (const variable of variables) {
    if (!finalEnv[variable] && !allowMissing.includes(variable)) {
      throw new Error(`${variable} must be set in environment variables`);
    }
    envVars[variable] = finalEnv[variable] as string;
  }

  return envVars;
}
