interface AttachmentField {
  title: string;
  value: string;
  short?: boolean;
}

interface AttachmentOptions {
  fallback?: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: AttachmentField[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: string;
}

export function createAttachment(options: AttachmentOptions) {
  return {
    ...options,
    ts: options.ts || `${Math.floor(Date.now() / 1000)}`,
  };
}

export function createAttachmentField(
  title: string,
  value: string,
  short = false,
): AttachmentField {
  return {
    title,
    value,
    short,
  };
}
