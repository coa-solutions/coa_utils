import {
  Application,
  Context,
  Response,
  Router,
} from "https://deno.land/x/oak/mod.ts";
import {
  createButtonSection,
  createMrkdwnField,
  createMrkdwnSection,
  createTextSection,
  sendMessageToSlack,
  uploadFileToSlack,
} from "./slack/mod.ts";
import type { KnownBlock } from "./slack/mod.ts";

const router = new Router();

router.post("/slack/coa_utils", async (context: Context) => {
  try {
    const req = context.request;
    const body = await req.body({ type: "json" }).value;

    const baseBlocks: KnownBlock[] = [];

    // const _ts = await sendMessageToSlack(baseBlocks);

    context.response.status = 200;
    context.response.body = "OK";
  } catch (e) {
    if (e instanceof Response) {
      context.response = e;
      return;
    }
    console.error("Error processing request:", e);
    await sendMessageToSlack([
      createMrkdwnSection(`*Error Occurred* \n\`\`\`${e.toString()}\`\`\``),
    ]);
    context.response.status = 500;
  }
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
