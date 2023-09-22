import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";

import {
  createActionBlock,
  createAdjudicateAttachment,
  createAttachment,
  createAttachmentField,
  createButtonSection,
  createContextBlock,
  createDividerBlock,
  createHeaderBlock,
  createImageBlock,
  createMrkdwnField,
  createMrkdwnSection,
  createTextSection,
  KnownBlock,
  MessageAttachment,
  sendMessageToSlack,
  updateMessageInSlack,
} from "./mod.ts";

Deno.test("Slack API Tests using mock_fetch", async (t) => {
  // Install mock fetch globally
  mf.install();

  // Helper to mock a Slack API response
  const mockSlackAPI = (url: string, responseBody: string, status: number) => {
    mf.mock(`POST@${url}`, () => {
      return new Response(responseBody, { status });
    });
  };

  // Mocking Slack's postMessage API for success scenario
  mockSlackAPI("/api/chat.postMessage", `{"ok": true, "ts": "some_ts"}`, 200);

  await t.step("sendMessageToSlack should return a timestamp", async () => {
    const blocks: KnownBlock[] = [
      {
        type: "section",
        text: { type: "mrkdwn", text: "Hello" },
      },
    ];
    const response = await sendMessageToSlack({ blocks });
    assertEquals(response.ts, "some_ts");
  });

  // Mocking Slack's postMessage API for error scenario
  mockSlackAPI(
    "/api/chat.postMessage",
    `{"ok": false, "error": "some_error"}`,
    400,
  );

  await t.step(
    "sendMessageToSlack should throw an error for bad request",
    async () => {
      const blocks: KnownBlock[] = [
        {
          type: "section",
          text: { type: "mrkdwn", text: "Hello" },
        },
      ];
      try {
        await sendMessageToSlack({ blocks });
      } catch (error) {
        assertEquals(
          error.message,
          'Failed to send message to Slack: 400: {"ok": false, "error": "some_error"}',
        );
      }
    },
  );

  // Mocking Slack's chat.postMessage for threads
  mockSlackAPI("/api/chat.postMessage", `{"ok": true}`, 200);

  await t.step("sendThreadedMessageToSlack should succeed", async () => {
    const blocks: KnownBlock[] = [
      {
        type: "section",
        text: { type: "mrkdwn", text: "Hello" },
      },
    ];
    await sendMessageToSlack({ blocks, threadTs: "some_thread_ts" });
  });

  // Mocking Slack's chat.update API
  mockSlackAPI("/api/chat.update", `{"ok": true}`, 200);

  await t.step("updateMessageInSlack should succeed", async () => {
    const blocks: KnownBlock[] = [
      {
        type: "section",
        text: { type: "mrkdwn", text: "Markdown Message" },
      },
    ];
    await updateMessageInSlack("some_ts", blocks);
  });

  // Reset handlers and uninstall mock fetch
  mf.reset();
  mf.uninstall();

  await sendExampleBlocksToSlack();
});

async function sendExampleBlocksToSlack() {
  const channelId = "C05S80996FR"; // Replace this with the actual channel ID

  // Start by sending a message stating that the tests are starting
  const startTime = new Date().toLocaleString();

  // Add a divider block before the batch of example blocks
  const dividerBlock = createDividerBlock();
  await sendMessageToSlack({ blocks: [dividerBlock], channelId });

  await sendMessageToSlack({
    text: `Starting tests at ${startTime}`,
    channelId,
  });

  const exampleBlocks: Array<{
    title: string;
    options: {
      text?: string;
      blocks?: KnownBlock[];
      attachments?: MessageAttachment[];
    };
  }> = [
    {
      title: "Text Section",
      options: {
        blocks: [createTextSection("This is a text section.")],
      },
    },
    {
      title: "Button Section",
      options: {
        blocks: [
          createButtonSection(
            "This is a button section.",
            "Click Me",
            "http://example.com",
          ),
        ],
      },
    },
    {
      title: "Markdown Section",
      options: {
        blocks: [createMrkdwnSection("*This is a Markdown section.*")],
      },
    },
    {
      title: "Image Block",
      options: {
        blocks: [
          createImageBlock(
            "https://via.placeholder.com/300x200",
            "Example Image",
          ),
        ],
      },
    },
    {
      title: "Divider Block",
      options: {
        blocks: [createDividerBlock()],
      },
    },
    {
      title: "Context Block",
      options: {
        blocks: [
          createContextBlock([
            createMrkdwnField("*This is a Markdown field.*"),
            {
              type: "image",
              image_url: "https://via.placeholder.com/300x200",
              alt_text: "Small Example Image",
            },
          ]),
        ],
      },
    },
    {
      title: "Action Block",
      options: {
        blocks: [
          createActionBlock([
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Action Button",
              },
              value: "button_click",
            },
          ]),
        ],
      },
    },
    {
      title: "Header Block",
      options: {
        blocks: [createHeaderBlock("This is a Header")],
      },
    },
    {
      title: "Atachment Fully Loaded",
      options: {
        blocks: [],
        attachments: [
          createAttachment({
            fallback: "This is a fallback text for the attachment.",
            color: "#36a64f",
            pretext: "This is an attachment pretext.",
            author_name: "John Doe",
            author_icon: "http://flickr.com/icons/bobby.jpg",
            title: "Attachment Title",
            title_link: "https://www.example.com/",
            text: "Attachment main text.",
            fields: [
              createAttachmentField({ title: "Field 1", value: "Value 1" }),
              createAttachmentField({ title: "Field 2", value: "Value 2" }),
            ],
            image_url: "http://my-website.com/path/to/image.jpg",
            thumb_url: "http://example.com/path/to/thumb.png",
            footer: "Attachment Footer",
            footer_icon:
              "https://platform.slack-edge.com/img/default_application_icon.png",
          }),
        ],
      },
    },
    {
      title: "Atachment - Adjudicate",
      options: {
        text: "We've successfully processed the file!! 🎉",
        attachments: [
          createAdjudicateAttachment({
            appealId: "12345",
            formattedFileName: "file.txt",
            fileSize: "2MB",
            docketNumber: "6789",
            firstName: "John",
            lastName: "Doe",
            // middleName is left out
            numOfDocs: 2,
            // numOfPages is left out
            // roundedPagesRatio is left out
            elapsedTimeStr: "5s",
            caseUrl: "http://example.com",
            color: "good",
          }),
        ],
      },
    },
  ];

  for (const { title, options } of exampleBlocks) {
    const titleBlock = createMrkdwnSection(`\`\`\`${title}\`\`\``);
    await sendMessageToSlack({
      channelId,
      text: options.text, // Note the change here
      blocks: [titleBlock, ...(options.blocks || [])], // And here
      attachments: options.attachments, // And here
    });
  }

  // Add a divider block after the batch of example blocks
  await sendMessageToSlack({ blocks: [dividerBlock], channelId });

  // Finish by sending a message stating that the tests ran successfully
  const endTime = new Date().toLocaleString();
  await sendMessageToSlack({
    text: `Tests ran successfully at ${endTime}`,
    channelId,
  });

  // Add a divider block after the batch of example blocks
  await sendMessageToSlack({ blocks: [dividerBlock], channelId });
}
