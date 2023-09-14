// utils_test.ts
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import { validateAndGetEnvVars } from "./utils.ts"; // Adjust the import path as necessary

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
  // Append variables to .env
  await appendEnvVars("\nTEST_VAR=TEST_VALUE\nCONTENT=FROM_ENV_FILE");

  await t.step("Should return expected variables", async () => {
    const result = await validateAndGetEnvVars(["TEST_VAR"]);
    assertEquals(result, { TEST_VAR: "TEST_VALUE" });
  });

  await t.step("Should throw when variable is missing", async () => {
    await assertRejects(
      async () => {
        await validateAndGetEnvVars(["MISSING_VAR"]); // This is expected to throw an error
      },
      Error,
      "MISSING_VAR must be set in environment variables.",
    );
  });

  await t.step(
    "Should not throw when missing variable is allowed",
    async () => {
      const result = await validateAndGetEnvVars(["MISSING_VAR"], [
        "MISSING_VAR",
      ]);
      assertEquals(result, {}); // Note that the MISSING_VAR key is not present at all
    },
  );

  await t.step("Should respect the 'ENV' setting", async () => {
    Deno.env.set("ENV", "dev");
    const resultDev = await validateAndGetEnvVars(["CONTENT"]);
    assertEquals(resultDev, { CONTENT: "FROM_ENV_FILE" });

    Deno.env.set("ENV", "prod");
    Deno.env.set("CONTENT", "FROM_ENV");
    const resultProd = await validateAndGetEnvVars(["CONTENT"]);
    assertEquals(resultProd, { CONTENT: "FROM_ENV" });

    Deno.env.delete("ENV");
    Deno.env.delete("CONTENT");
  });

  // Remove appended variables from .env
  await removeAppendedEnvVars(2); // Remove the last 2 lines we added
});
