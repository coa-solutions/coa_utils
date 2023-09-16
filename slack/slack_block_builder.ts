import { KnownBlock, MrkdwnElement, SectionBlock } from "./slack.d.ts";

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

export function createImageBlock(
  image_url: string,
  alt_text: string,
  block_id?: string,
): KnownBlock {
  return {
    type: "image",
    image_url,
    alt_text,
    ...(block_id ? { block_id } : {}),
  };
}

export function createDividerBlock(block_id?: string): KnownBlock {
  return {
    type: "divider",
    ...(block_id ? { block_id } : {}),
  };
}

export function createContextBlock(
  elements: (
    | MrkdwnElement
    | { type: "image"; image_url: string; alt_text: string }
  )[],
  block_id?: string,
): KnownBlock {
  return {
    type: "context",
    elements,
    ...(block_id ? { block_id } : {}),
  };
}

export function createActionBlock(
  elements: any[],
  block_id?: string,
): KnownBlock {
  return {
    type: "actions",
    elements,
    ...(block_id ? { block_id } : {}),
  };
}

export function createHeaderBlock(text: string, block_id?: string): KnownBlock {
  return {
    type: "header",
    text: {
      type: "plain_text",
      text,
    },
    ...(block_id ? { block_id } : {}),
  };
}
