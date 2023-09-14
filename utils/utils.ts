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
  let finalEnv: Record<string, string | undefined>;

  if (ENV === "prod") {
    finalEnv = Deno.env.toObject();
  } else {
    finalEnv = await load();
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
