import { Application, Router } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import { tokenTracker } from "./TokenTracker.ts";


tokenTracker
  .addToken("0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735")


const router = new Router();
router
  .get("/", (context) => { // all donations
    context.response.body = tokenTracker.UserTokenBalances;
  })
  .get("/user/:pubkey", (context) => { // user specific donations
    context.response.body = tokenTracker.UserTokenBalances[context?.params?.pubkey];
  })

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });