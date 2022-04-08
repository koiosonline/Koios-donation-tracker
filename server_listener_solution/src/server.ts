import { Application, Router } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import type {ListenOptions} from "https://deno.land/x/oak@v10.5.1/mod.ts";
import { tokenTracker } from "./TokenTracker.ts";

export default async function startServer(options: ListenOptions){
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
    
    await app.listen(options);
}
