import {
  Application,
  Context,
  Response,
  Router,
} from "https://deno.land/x/oak/mod.ts";
import { createMrkdwnSection, sendSlackMessage } from "./slack/mod.ts";
import type { KnownBlock } from "./slack/mod.ts";
import { validateAndGetEnvVars } from "./utils/utils.ts";
import { createHeaderBlock } from "./slack/slack_block_builder.ts";

const { URL_PATH_SECRET_KEY } = await validateAndGetEnvVars([
  "URL_PATH_SECRET_KEY",
]);

const router = new Router();

router.post(
  `/${URL_PATH_SECRET_KEY}/slack/coa_utils`,
  async (context: Context) => {
    try {
      const req = context.request;
      const body = await req.body({ type: "json" }).value;

      const baseBlocks: KnownBlock[] = [
        createHeaderBlock("COA Utils"),
        createMrkdwnSection(`*Tests:* ${body.tests}`),
        createMrkdwnSection(`*Benchmarks:* ${body.benchmarks}`),
        createMrkdwnSection(
          `*Latest Tag:* <https://deno.land/x/coa_utils@${body.tag}|${body.tag}>`,
        ),
      ];

      await sendSlackMessage({ blocks: baseBlocks });

      context.response.status = 200;
      context.response.body = "OK";
    } catch (e) {
      if (e instanceof Response) {
        context.response = e;
        return;
      }
      console.error("Error processing request:", e);
      await sendSlackMessage({
        blocks: [
          createMrkdwnSection(`*Error Occurred* \n\`\`\`${e.toString()}\`\`\``),
        ],
      });
      context.response.status = 500;
    }
  },
);

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
