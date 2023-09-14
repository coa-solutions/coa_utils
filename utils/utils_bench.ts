import { validateAndGetEnvVars } from "./utils.ts";

// Create a .env file for testing
Deno.writeTextFileSync(".env", "VAR1=value1\nVAR2=value2");

// Define the benchmark for when ENV is set to 'prod'
Deno.env.set("ENV", "prod");
Deno.bench("validateAndGetEnvVars in prod", () => {
  validateAndGetEnvVars(["VAR1", "VAR2"]);
});

// Reset ENV to something other than 'prod' and use the .env file for testing
Deno.env.set("ENV", "dev");
Deno.bench("validateAndGetEnvVars in dev", () => {
  validateAndGetEnvVars(["VAR1", "VAR2"]);
});
