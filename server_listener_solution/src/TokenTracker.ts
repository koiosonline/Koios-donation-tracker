import {ethers, utils, Contract} from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import "https://deno.land/std@0.134.0/dotenv/load.ts";
import {ERC20} from "./abi/ERC20.ts"
import Singleton from "https://deno.land/x/singleton@v1.1.0/mod.ts"

interface IUserDonations {
    value: number
}
interface ILogEvent {
    blockNumber: number
}

type address = string;

export class TokenTracker {
    lastProcessedBlock = 0; // TODO: come from file? avoid dupes?..
    UserTokenBalances: Record<string, Record<string, IUserDonations>> = {};
    provider: unknown;
    DONATION_ACCOUNT = Deno.env.get("donation_account") || ""
    supportedTokens: Map<address, Contract> = new Map(); // TODO: save this to file for ref later

    /**
     * Uses the InfuraProvider by default. key is required
     */
    constructor(){
        console.log(`[+] Listening for donations towards [${this.DONATION_ACCOUNT}].`);
        this.provider = new ethers.providers.InfuraProvider(Deno.env.get("network"), Deno.env.get("provider_key"));
    }

    addProvider(provider: unknown){
        this.provider = provider;
    }

    getDonatedTokenAmount(user: string, token: string){
        return this.UserTokenBalances[user][token]?.value || 0;
    }

    addToken(token: string){
        const contract = new ethers.Contract(token, ERC20, this.provider);
        this.supportedTokens.set(token, contract);

        const topicSets = {
            topics: [
                utils.id("Transfer(address,address,uint256)"),
                null,
                utils.hexZeroPad(this.DONATION_ACCOUNT, 32),
            ]
        }
        contract.on(topicSets,(from: string, _: string, value: string, {blockNumber}: ILogEvent) => {
            if(blockNumber > this.lastProcessedBlock){
                ((this.UserTokenBalances[from] ??= {})[token] ??= {value: 0}).value += Number(value); // lol sns
                this.lastProcessedBlock = blockNumber;
                console.log(`[+] Received transaction from: ${from}`);
            }
        });
        return this;
    }
    // TODO: we need to take old transactions and match back in case this server ends up being offline...
}



export const tokenTracker = Singleton(()=> new TokenTracker()).getInstance();