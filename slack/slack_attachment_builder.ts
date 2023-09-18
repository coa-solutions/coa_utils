import { AttachmentAction, MessageAttachment } from "./mod.ts";

interface AttachmentField {
  title: string;
  value: string;
  short?: boolean;
}

export function createAttachment(options: MessageAttachment) {
  return {
    ...options,
    ts: options.ts || `${Math.floor(Date.now() / 1000)}`,
  };
}

export function createAttachmentField({
  title,
  value,
  short = false,
}: {
  title: string;
  value: string | number | undefined;
  short?: boolean;
}): AttachmentField {
  return {
    title,
    value: value === undefined ? "" : String(value),
    short,
  };
}

interface AdjudicateAttachmentOptions {
  appealId?: string;
  formattedFileName?: string;
  fileSize?: string;
  docketNumber?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  numOfDocs?: number;
  numOfPages?: number;
  roundedPagesRatio?: number;
  elapsedTimeStr?: string;
  caseUrl?: string;
  color: "good" | "warning" | "danger" | undefined;
}

export function createAdjudicateAttachment(
  options: AdjudicateAttachmentOptions,
): MessageAttachment {
  const fields = [
    { title: "Appeal Id", value: options.appealId, short: false },
    { title: "File Received", value: options.formattedFileName, short: false },
    { title: "File Size", value: options.fileSize, short: false },
    { title: "Docket Number", value: options.docketNumber, short: false },
    { title: "First Name", value: options.firstName, short: true },
    { title: "Last Name", value: options.lastName, short: true },
    { title: "Middle Name", value: options.middleName, short: true },
    { title: "Number of Docs", value: options.numOfDocs, short: true },
    { title: "Number of Pages", value: options.numOfPages, short: true },
    { title: "Pages Ratio", value: options.roundedPagesRatio, short: true },
    { title: "Processing Time", value: options.elapsedTimeStr, short: false },
  ]
    .filter((field) => {
      if (
        [
          "Number of Docs",
          "Number of Pages",
          "Pages Ratio",
          "Elapsed Time",
        ].includes(field.title)
      ) {
        return field.value !== undefined;
      }
      return true;
    })
    .map((field) => createAttachmentField(field));

  const actions: AttachmentAction[] = options.caseUrl
    ? [
        {
          type: "button",
          text: "View Case",
          url: options.caseUrl,
        } as AttachmentAction,
      ]
    : [];

  return createAttachment({
    ...(options.color && { color: options.color }),
    fields,
    actions,
    ts: String(Math.floor(new Date().getTime() / 1000)),
  });
}
