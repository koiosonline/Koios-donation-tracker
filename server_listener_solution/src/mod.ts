import startServer from "./server.ts";
import { tokenTracker } from "./TokenTracker.ts";

/**
 * Add supported tokens here...
 * 
 * Due to the way the Ethers registers callbacks it is not possible to fetch
 * tokens from an array-like value and traverse over them to register all tokens.
 * This is due to the GC kicking in right after the function exiting and 
 * thus removes all the listeners (yes even with anonymous functions).
 */
tokenTracker
  .addToken("0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735") // DAI
  .addToken("0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b") // USDC







  startServer({ port:8000 })