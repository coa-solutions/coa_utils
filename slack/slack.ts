import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";
import { validateAndGetEnvVars } from "../utils/utils.ts";
import type * as SlackTypes from "./slack.d.ts";
import { ChatPostMessageArgs } from "./slack.d.ts";

const { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID } = await validateAndGetEnvVars([
  "SLACK_BOT_TOKEN",
  "SLACK_CHANNEL_ID",
]);

const client = SlackAPI(SLACK_BOT_TOKEN);

const DEFAULT_OPTIONS = {
  channel: SLACK_CHANNEL_ID,
  unfurl_links: false,
};

type SlackAPIResponse = {
  ok: boolean;
  error?: string;
  errors?: string[];
  ts?: string;
};

type MessageOptions = ChatPostMessageArgs;

function handleError(result: SlackAPIResponse) {
  console.log("handleError received:", result);  // Debugging line
  if (!result.ok) {
    const errorMsg = result.errors ? result.errors.join(", ") : "";
    throw new Error(
      `Failed to send message to Slack: ${result.error}, Errors: ${errorMsg}`,
    );
  }
}

async function postMessage(options: MessageOptions): Promise<SlackAPIResponse> {
  try {
    const result = await client.chat.postMessage(options);
    return result;
  } catch (e) {
    throw new Error(`Failed to send message to Slack: ${e.message}`);
  }
}

export async function sendMessageToSlack(
  blocks: SlackTypes.KnownBlock[],
  attachments: SlackTypes.MessageAttachment[] = [],
  text?: string,
): Promise<string> {
  const messageOptions: MessageOptions = {
    ...DEFAULT_OPTIONS,
    blocks,
    attachments,
    text,
  };

  const result = await postMessage(messageOptions);
  handleError(result);

  return result.ts!;
}

export async function sendThreadedMessageToSlack(
  blocks: SlackTypes.KnownBlock[],
  threadTs: string,
  attachments: SlackTypes.MessageAttachment[] = [],
  text?: string,
): Promise<void> {
  const messageOptions: MessageOptions = {
    ...DEFAULT_OPTIONS,
    blocks,
    attachments,
    text,
    thread_ts: threadTs,
  };

  const result = await postMessage(messageOptions);
  handleError(result);
}

type UpdateMessageArgs = {
  ts: string;
  channel: string;
  text?: string;
  attachments?: SlackTypes.MessageAttachment[];
  blocks?: SlackTypes.KnownBlock[];
  [otherOptions: string]: any;
};

export async function updateMessageInSlack(
  ts: string,
  blocks?: SlackTypes.KnownBlock[],
  attachments?: SlackTypes.MessageAttachment[],
  text?: string
): Promise<void> {
  const updateOptions: UpdateMessageArgs = {
    ...DEFAULT_OPTIONS,
    ts,
    blocks,
    attachments,
    text,
  };

  const result = await client.chat.update(updateOptions);
  handleError(result);
}

export async function uploadFileToSlack(
  payload: object,
  threadTs: string
): Promise<void> {
  const message = JSON.stringify(payload, null, 2);

  const result = await client.files.upload({
    channels: SLACK_CHANNEL_ID,
    content: message,
    filetype: "json",
    filename: "payload.json",
    thread_ts: threadTs,
  });

  handleError(result); // Add this line for error handling

  console.log("Payload posted to Slack as a JSON file in a thread.");
}

export async function deleteMessageInSlack(
  ts: string,
  channel: string = SLACK_CHANNEL_ID
): Promise<void> {
  const deleteOptions = {
    channel,
    ts,
  };

  const result = await client.chat.delete(deleteOptions);
  handleError(result);

  console.log(`Deleted message with timestamp ${ts} in channel ${channel}`);
}