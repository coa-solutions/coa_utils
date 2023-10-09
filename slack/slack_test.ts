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
  sendSlackMessage,
} from "./mod.ts";
import { ChatPostMessageSuccessfulResponse } from "./slack_deno.d.ts";

Deno.test("Slack API Tests using mock_fetch", async (t) => {
  await t.step("sendSlackMessage should return a reponse", async () => {
    const response = (await sendSlackMessage({
      channelId: "C05S80996FR",
      blocks: [createTextSection("Hello")],
    })) as ChatPostMessageSuccessfulResponse;

    assertEquals(response.ok, true);
  });

  await t.step(
    "sendSlackMessage should return created a threaded reply",
    async () => {
      const response = (await sendSlackMessage({
        channelId: "C05S80996FR",
        blocks: [createTextSection("Hello Thread")],
      })) as ChatPostMessageSuccessfulResponse;

      const threadResponse = (await sendSlackMessage({
        channelId: "C05S80996FR",
        thread: true,
        parentTs: response.ts,
        blocks: [createTextSection("Hello Back to you")],
      })) as ChatPostMessageSuccessfulResponse;

      assertEquals(threadResponse.ok, true);
    },
  );

  await t.step("sendSlackMessage should update a parent message", async () => {
    const response = (await sendSlackMessage({
      channelId: "C05S80996FR",
      blocks: [createTextSection("I'm Parent")],
    })) as ChatPostMessageSuccessfulResponse;

    const updateResponse = (await sendSlackMessage({
      channelId: "C05S80996FR",
      parentTs: response.ts,
      blocks: [createTextSection("I'm updated Parent")],
    })) as ChatPostMessageSuccessfulResponse;

    assertEquals(updateResponse.ok, true);
  });

  await t.step("sendSlackMessage should update a thread message", async () => {
    const response = (await sendSlackMessage({
      channelId: "C05S80996FR",
      blocks: [createTextSection("I'm Parent")],
    })) as ChatPostMessageSuccessfulResponse;
    const threadResponse = (await sendSlackMessage({
      channelId: "C05S80996FR",
      thread: true,
      parentTs: response.ts,
      blocks: [createTextSection("I'm Thread")],
    })) as ChatPostMessageSuccessfulResponse;
    const updateThreadResponse = (await sendSlackMessage({
      channelId: "C05S80996FR",
      thread: true,
      threadTs: threadResponse.ts,
      blocks: [createTextSection("I'm updated Thread")],
    })) as ChatPostMessageSuccessfulResponse;

    assertEquals(updateThreadResponse.ok, true);
  });

  // await sendExampleBlocksToSlack();
});

// async function sendExampleBlocksToSlack() {
//   const channelId = "C05S80996FR"; // Replace this with the actual channel ID

//   // Start by sending a message stating that the tests are starting
//   const startTime = new Date().toLocaleString();

//   // Add a divider block before the batch of example blocks
//   const dividerBlock = createDividerBlock();
//   await sendSlackMessage({ blocks: [dividerBlock], channelId });

//   await sendSlackMessage({
//     text: `Starting tests at ${startTime}`,
//     channelId,
//   });

//   const exampleBlocks: Array<{
//     title: string;
//     options: {
//       text?: string;
//       blocks?: KnownBlock[];
//       attachments?: MessageAttachment[];
//     };
//   }> = [
//     {
//       title: "Text Section",
//       options: {
//         blocks: [createTextSection("This is a text section.")],
//       },
//     },
//     {
//       title: "Button Section",
//       options: {
//         blocks: [
//           createButtonSection(
//             "This is a button section.",
//             "Click Me",
//             "http://example.com",
//           ),
//         ],
//       },
//     },
//     {
//       title: "Markdown Section",
//       options: {
//         blocks: [createMrkdwnSection("*This is a Markdown section.*")],
//       },
//     },
//     {
//       title: "Image Block",
//       options: {
//         blocks: [
//           createImageBlock(
//             "https://via.placeholder.com/300x200",
//             "Example Image",
//           ),
//         ],
//       },
//     },
//     {
//       title: "Divider Block",
//       options: {
//         blocks: [createDividerBlock()],
//       },
//     },
//     {
//       title: "Context Block",
//       options: {
//         blocks: [
//           createContextBlock([
//             createMrkdwnField("*This is a Markdown field.*"),
//             {
//               type: "image",
//               image_url: "https://via.placeholder.com/300x200",
//               alt_text: "Small Example Image",
//             },
//           ]),
//         ],
//       },
//     },
//     {
//       title: "Action Block",
//       options: {
//         blocks: [
//           createActionBlock([
//             {
//               type: "button",
//               text: {
//                 type: "plain_text",
//                 text: "Action Button",
//               },
//               value: "button_click",
//             },
//           ]),
//         ],
//       },
//     },
//     {
//       title: "Header Block",
//       options: {
//         blocks: [createHeaderBlock("This is a Header")],
//       },
//     },
//     {
//       title: "Atachment Fully Loaded",
//       options: {
//         blocks: [],
//         attachments: [
//           createAttachment({
//             fallback: "This is a fallback text for the attachment.",
//             color: "#36a64f",
//             pretext: "This is an attachment pretext.",
//             author_name: "John Doe",
//             author_icon: "http://flickr.com/icons/bobby.jpg",
//             title: "Attachment Title",
//             title_link: "https://www.example.com/",
//             text: "Attachment main text.",
//             fields: [
//               createAttachmentField({ title: "Field 1", value: "Value 1" }),
//               createAttachmentField({ title: "Field 2", value: "Value 2" }),
//             ],
//             image_url: "http://my-website.com/path/to/image.jpg",
//             thumb_url: "http://example.com/path/to/thumb.png",
//             footer: "Attachment Footer",
//             footer_icon:
//               "https://platform.slack-edge.com/img/default_application_icon.png",
//           }),
//         ],
//       },
//     },
//     {
//       title: "Atachment - Adjudicate",
//       options: {
//         text: "We've successfully processed the file!! 🎉",
//         attachments: [
//           createAdjudicateAttachment({
//             appealId: "12345",
//             formattedFileName: "file.txt",
//             fileSize: "2MB",
//             docketNumber: "6789",
//             firstName: "John",
//             lastName: "Doe",
//             // middleName is left out
//             numOfDocs: 2,
//             // numOfPages is left out
//             // roundedPagesRatio is left out
//             elapsedTimeStr: "5s",
//             caseUrl: "http://example.com",
//             color: "good",
//           }),
//         ],
//       },
//     },
//   ];

//   for (const { title, options } of exampleBlocks) {
//     const titleBlock = createMrkdwnSection(`\`\`\`${title}\`\`\``);
//     await sendSlackMessage({
//       channelId,
//       text: options.text, // Note the change here
//       blocks: [titleBlock, ...(options.blocks || [])], // And here
//       attachments: options.attachments, // And here
//     });
//   }

//   // Add a divider block after the batch of example blocks
//   await sendSlackMessage({ blocks: [dividerBlock], channelId });

//   // Finish by sending a message stating that the tests ran successfully
//   const endTime = new Date().toLocaleString();
//   await sendSlackMessage({
//     text: `Tests ran successfully at ${endTime}`,
//     channelId,
//   });

//   // Add a divider block after the batch of example blocks
//   await sendSlackMessage({ blocks: [dividerBlock], channelId });
// }
