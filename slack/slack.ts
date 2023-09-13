import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";

import { validateAndGetEnvVars } from "../utils.ts"; // Assuming utils.ts is in the same directory
import type * as SlackTypes from "./slack.d.ts";

const { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID } = validateAndGetEnvVars([
  "SLACK_BOT_TOKEN",
  "SLACK_CHANNEL_ID",
]);

const client = SlackAPI(SLACK_BOT_TOKEN);

const defaultOptions = {
  channel: SLACK_CHANNEL_ID,
  unfurl_links: false,
};

export type SlackPayloadFormatter = (payload: any) => {
  blocks: SlackTypes.Block[];
  attachments: SlackTypes.MessageAttachment[];
};

export async function sendMessageToSlack(
  blocks: SlackTypes.KnownBlock[],
  attachments?: SlackTypes.MessageAttachment[],
  text?: string,
): Promise<string> {
  const messageOptions = {
    ...defaultOptions,
    blocks,
    attachments,
    text,
  };

  const result = await client.chat.postMessage(messageOptions);

  if (!result.ok) {
    throw new Error(
      `Failed to send message to Slack: ${result.error}, Errors: ${result.errors}`,
    );
  }

  return result.ts;
}

export async function sendThreadedMessageToSlack(
  blocks: object[],
  threadTs: string,
  attachments?: any[],
  text?: string,
): Promise<void> {
  const messageString = JSON.stringify({ blocks, attachments, text });

  if (messageString.length > 40000) {
    throw new Error("Message payload is too large for Slack");
  }

  const messageOptions = {
    ...defaultOptions,
    blocks,
    attachments,
    text,
    thread_ts: threadTs,
  };

  const result = await client.chat.postMessage(messageOptions);

  if (!result.ok) {
    throw new Error(
      `Failed to send message to Slack: ${result.error}, Errors: ${
        result.errors.join(", ")
      }`,
    );
  }
}

export async function uploadFileToSlack(
  payload: object,
  threadTs: string,
): Promise<void> {
  const message = JSON.stringify(payload, null, 2);

  await client.files.upload({
    channels: SLACK_CHANNEL_ID,
    content: message,
    filetype: "json",
    filename: "payload.json",
    thread_ts: threadTs,
  });

  console.log("Payload posted to Slack as a JSON file in a thread.");
}

export type * as SlackTypes from "./slack.d.ts";