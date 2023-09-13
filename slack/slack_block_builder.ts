import { KnownBlock, SectionBlock, MrkdwnElement } from "./slack.d.ts";

export function createTextSection(
  text: string,
  block_id?: string,
): SectionBlock {
  return {
    type: "section",
    ...(block_id ? { block_id } : {}),
    text: {
      type: "mrkdwn",
      text,
    },
  };
}

export function createButtonSection(
  text: string,
  buttonText: string,
  url: string,
  style: "danger" | "primary" | null = null,
  fields: MrkdwnElement[] = [],
  block_id?: string,
): SectionBlock {
  return {
    type: "section",
    ...(block_id ? { block_id } : {}),
    text: {
      type: "mrkdwn",
      text,
    },
    ...(fields.length && { fields }),
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: buttonText,
      },
      url,
      ...(style && { style }),
    },
  };
}

export function createMrkdwnSection(
  text: string,
  block_id?: string,
): KnownBlock {
  return {
    type: "section",
    ...(block_id ? { block_id } : {}),
    text: {
      type: "mrkdwn",
      text,
    },
  };
}

export function createMrkdwnField(text: string): MrkdwnElement {
  return {
    type: "mrkdwn",
    text,
  };
}
