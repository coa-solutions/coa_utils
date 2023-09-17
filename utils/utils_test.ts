import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import { validateAndGetEnvVars } from "./utils.ts";

// Function to append variables to .env
async function appendEnvVars(vars: string) {
  await Deno.writeTextFile(".env", vars, { append: true });
}

// Function to remove appended variables from .env
async function removeAppendedEnvVars(linesToRemove: number) {
  const content = await Deno.readTextFile(".env");
  const lines = content.split("\n");
  lines.splice(-linesToRemove, linesToRemove);
  await Deno.writeTextFile(".env", lines.join("\n"));
}

Deno.test("validateAndGetEnvVars functionality", async (t) => {
  // Store original environment variables to restore later
  const originalEnv = { ...Deno.env.toObject() };

  // Clear all environment variables to isolate test
  for (const key of Object.keys(originalEnv)) {
    Deno.env.delete(key);
  }

  // Append variables to .env for DEV environment
  await appendEnvVars("\nTEST_VAR=TEST_VALUE_DEV\nCONTENT=FROM_ENV_FILE");

  // Test reading from .env file (DEV environment)
  Deno.env.set("ENV", "dev");
  await t.step("Should return expected variables in DEV", async () => {
    const result = await validateAndGetEnvVars(["TEST_VAR"]);
    assertEquals(result, { TEST_VAR: "TEST_VALUE_DEV" });
  });

  // Test reading from system environment (PROD environment)
  Deno.env.set("ENV", "prod");
  Deno.env.set("CONTENT", "FROM_ENV"); // <-- Set this for the test
  await t.step("Should return expected variables in PROD", async () => {
    const result = await validateAndGetEnvVars(["CONTENT"]);
    assertEquals(result, { CONTENT: "FROM_ENV" });
  });

  // Test reading from system environment (CI environment)
  Deno.env.set("CI", "true");
  Deno.env.set("CONTENT", "FROM_ENV"); // <-- Set this for the test
  await t.step("Should return expected variables in CI", async () => {
    const result = await validateAndGetEnvVars(["CONTENT"]);
    assertEquals(result, { CONTENT: "FROM_ENV" });
  });

  // Restore the original environment variables
  for (const [key, value] of Object.entries(originalEnv)) {
    Deno.env.set(key, value);
  }

  // Cleanup
  Deno.env.delete("ENV");
  Deno.env.delete("CI");
  Deno.env.delete("TEST_VAR");
  Deno.env.delete("CONTENT");
  // Remove appended variables from .env
  await removeAppendedEnvVars(2);
});
