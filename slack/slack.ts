// TODO: Add documentation

import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";
import { validateAndGetEnvVars } from "../utils/utils.ts";
import type * as SlackTypes from "./slack.d.ts";
import {
  BaseResponse,
  ChatPostMessageArgs,
  ChatPostMessageResponse,
} from "./slack_deno.d.ts";
import { KnownBlock, MessageAttachment } from "./slack.d.ts";

const { SLACK_BOT_TOKEN, SLACK_DEFAULT_CHANNEL_ID } =
  await validateAndGetEnvVars(
    ["SLACK_BOT_TOKEN", "SLACK_DEFAULT_CHANNEL_ID"],
    ["SLACK_DEFAULT_CHANNEL_ID"],
  );

const client = SlackAPI(SLACK_BOT_TOKEN);

type SlackAPIResponse = {
  ok: boolean;
  error?: string;
  errors?: string[];
  ts?: string;
};

function handleError(result: SlackAPIResponse) {
  if (!result.ok) {
    const errorMsg = result.errors ? result.errors.join(", ") : "";
    throw new Error(
      `Failed to send message to Slack: ${result.error}, Errors: ${errorMsg}`,
    );
  }
}

interface SendMessageOptions {
  text?: string;
  blocks?: KnownBlock[];
  attachments?: MessageAttachment[];
  threadTs?: string;
  channelId?: string;
}

export async function sendMessageToSlack(
  options: SendMessageOptions = {},
): Promise<ChatPostMessageResponse> {
  try {
    const { attachments, blocks, threadTs, text, channelId } = options;

    const ChatPostMessageArgs: Partial<ChatPostMessageArgs> = {
      channel: channelId || SLACK_DEFAULT_CHANNEL_ID,
      unfurl_links: false,
    };

    if (text) {
      ChatPostMessageArgs.text = text;
    }

    if (blocks && blocks.length > 0) {
      ChatPostMessageArgs.blocks = blocks;
    }

    if (attachments && attachments.length > 0) {
      ChatPostMessageArgs.attachments = attachments;
    }

    if (threadTs) {
      ChatPostMessageArgs.thread_ts = threadTs;
    }

    // Validate that one of text, blocks, or attachments is present
    if (
      !(
        ChatPostMessageArgs.text ||
        ChatPostMessageArgs.blocks ||
        ChatPostMessageArgs.attachments
      )
    ) {
      throw new Error("One of text, blocks, or attachments must be provided");
    }

    const result = await client.chat.postMessage(
      ChatPostMessageArgs as unknown as ChatPostMessageArgs,
    );

    handleError(result);

    return result;
  } catch (e) {
    throw new Error(`Failed to send message to Slack: ${e.message}`);
  }
}

type UpdateMessageOptions = {
  ts: string;
  channelId?: string;
  text?: string;
  attachments?: SlackTypes.MessageAttachment[];
  blocks?: SlackTypes.KnownBlock[];
  [otherOptions: string]: any;
};

export async function updateMessageInSlack(
  options: UpdateMessageOptions
): Promise<BaseResponse> {
  try {
    const { ts, blocks, attachments, text, channelId } = options;

    const updateOptions: UpdateMessageOptions = {
      channel: channelId || SLACK_DEFAULT_CHANNEL_ID,
      ts,
      unfurl_links: false,
    };

    if (text) {
      updateOptions.text = text;
    }

    if (blocks && blocks.length > 0) {
      updateOptions.blocks = blocks;
    }

    if (attachments && attachments.length > 0) {
      updateOptions.attachments = attachments;
    }

    // Validate that one of text, blocks, or attachments is present
    if (!(updateOptions.text || updateOptions.blocks || updateOptions.attachments)) {
      throw new Error("One of text, blocks, or attachments must be provided");
    }

    const result = await client.chat.update(updateOptions);

    handleError(result);

    return result;

  } catch (e) {
    throw new Error(`Failed to update message in Slack: ${e.message}`);
  }
}


export async function uploadFileToSlack(
  payload: object,
  threadTs: string,
): Promise<BaseResponse> {
  const message = JSON.stringify(payload, null, 2);

  const result = await client.files.upload({
    channels: SLACK_DEFAULT_CHANNEL_ID,
    content: message,
    filetype: "json",
    filename: "payload.json",
    thread_ts: threadTs,
  });

  handleError(result); // Add this line for error handling

  return result;
}

export async function deleteMessageInSlack(
  ts: string,
  channel: string = SLACK_DEFAULT_CHANNEL_ID,
): Promise<BaseResponse> {
  const deleteOptions = {
    channel,
    ts,
  };

  const result = await client.chat.delete(deleteOptions);

  handleError(result);

  return result;
}
