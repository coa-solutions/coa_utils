// TODO: Add documentation

import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";
import { validateAndGetEnvVars } from "../utils/utils.ts";
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

interface SendMessageOptions {
  channelId?: string;
  thread?: boolean;
  parentTs?: string;
  threadTs?: string;
  text?: string;
  blocks?: KnownBlock[];
  attachments?: MessageAttachment[];
}

function validateMessageArgs(args: ChatPostMessageArgs): void {
  if (!(args.text || args.blocks || args.attachments)) {
    throw new Error("One of text, blocks, or attachments must be provided");
  }
  if (!args.channel) {
    throw new Error("Channel must be provided");
  }
}

export async function sendSlackMessage(
  options: SendMessageOptions = {},
): Promise<BaseResponse | ChatPostMessageResponse> {
  try {
    const {
      attachments = [],
      blocks = [],
      thread = false,
      parentTs,
      threadTs,
      text,
      channelId = SLACK_DEFAULT_CHANNEL_ID,
    } = options;

    const ChatPostMessageArgs: ChatPostMessageArgs = {
      channel: channelId,
      text: text || "",
      blocks,
      attachments,
      unfurl_links: false,
    };

    await validateMessageArgs(ChatPostMessageArgs);

    if (!parentTs && !threadTs) {
      return await client.chat.postMessage(ChatPostMessageArgs);
    }

    if (thread && parentTs) {
      return await client.chat.postMessage({
        ...ChatPostMessageArgs,
        thread_ts: parentTs,
      });
    }

    if (thread && threadTs) {
      return await client.chat.update({
        ...ChatPostMessageArgs,
        ts: threadTs,
      });
    }

    const tsToUpdate = parentTs ? parentTs : threadTs;
    return await client.chat.update({
      ...ChatPostMessageArgs,
      ts: tsToUpdate,
    });
  } catch (e) {
    throw new Error(`Failed to send message to Slack: ${e.message}`);
  }
}

// export async function uploadFileToSlack(
//   payload: object,
//   ts: string,
// ): Promise<BaseResponse> {
//   const message = JSON.stringify(payload, null, 2);

//   const result = await client.files.upload({
//     channels: SLACK_DEFAULT_CHANNEL_ID,
//     content: message,
//     filetype: "json",
//     filename: "payload.json",
//     thread_ts: ts,
//   });

//   return result;
// }

// export async function deleteMessageInSlack(
//   ts: string,
//   channel: string = SLACK_DEFAULT_CHANNEL_ID,
// ): Promise<BaseResponse> {
//   const deleteOptions = {
//     channel,
//     ts,
//   };

//   const result = await client.chat.delete(deleteOptions);

//   return result;
// }
