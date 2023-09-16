// import { SlackFunctionTester } from "https://deno.land/x/deno_slack_sdk@2.2.0/mod.ts";
// import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
// import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";

// Replaces globalThis.fetch with the mocked copy
// mf.install();

// mf.mock("POST@/api/apps.datastore.put", () => {
//   return new Response(
//     `{"ok": true, "item": {"object_id": "d908f8bd-00c6-43f0-9fc3-4da3c2746e14"}}`,
//     {
//       status: 200,
//     },
//   );
// });

// Deno.test("Sample function test", async () => {
//   // await assertEquals(
//   //   outputs?.updatedMsg,
//   //   ":wave: <@U01234567> submitted the following message: \n\n>Hello, World!",
//   // );
// });
