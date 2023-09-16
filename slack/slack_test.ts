import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import {
  assertEquals,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import { 
  sendMessageToSlack, 
  sendThreadedMessageToSlack, 
  updateMessageInSlack 
} from "./slack.ts";
import { KnownBlock } from "./mod.ts";

Deno.test("Slack API Tests using mock_fetch", async (t) => {

  // Install mock fetch globally
  mf.install();

  // Mocking Slack's postMessage API for success scenario
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": true, "ts": "some_ts"}`,
      {
        status: 200,
      }
    );
  });

  await t.step("sendMessageToSlack should return a timestamp", async () => {
    const blocks: KnownBlock[] = [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }];
    const responseTimestamp = await sendMessageToSlack(blocks);
    assertEquals(responseTimestamp, "some_ts");
  });

  // Mocking Slack's postMessage API for error scenario
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": false, "error": "some_error"}`,
      {
        status: 400,
      }
    );
  });

  await t.step("sendMessageToSlack should throw an error for bad request", async () => {
    const blocks: KnownBlock[] = [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }];
    try {
      await sendMessageToSlack(blocks);
    } catch (error) {
      assertEquals(error.message, 'Failed to send message to Slack: 400: {"ok": false, "error": "some_error"}');
    }
  });

  // Mocking Slack's chat.postMessage for threads
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": true}`,
      {
        status: 200,
      }
    );
  });

  await t.step("sendThreadedMessageToSlack should succeed", async () => {
    const blocks: KnownBlock[] = [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }];
    await sendThreadedMessageToSlack(blocks, "some_thread_ts");
  });

  // Mocking Slack's chat.update API
  mf.mock("POST@/api/chat.update", () => {
    return new Response(
      `{"ok": true}`,
      {
        status: 200,
      }
    );
  });

  await t.step("updateMessageInSlack should succeed", async () => {
    const blocks: KnownBlock[] = [{ type: "section", text: { type: "mrkdwn", text: "Markdown Message" } }];
    await updateMessageInSlack("some_ts", blocks);
  });

  // Reset handlers and uninstall mock fetch
  mf.reset();
  mf.uninstall();
});
