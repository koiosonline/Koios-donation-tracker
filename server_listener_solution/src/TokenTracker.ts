import {ethers, utils, Contract} from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import "https://deno.land/std@0.134.0/dotenv/load.ts";
import {ERC20} from "./abi/ERC20.ts"
import Singleton from "https://deno.land/x/singleton@v1.1.0/mod.ts"
import { DB } from "./db.ts";

interface IUserDonations {
    value: number
}
interface ILogEvent {
    blockNumber: number,
    address: string
}

interface ITokenTrackerData {
    lastProcessedBlock: number,
    userTokenBalances: Record<string, Record<string, IUserDonations>>
}

type address = string;

export class TokenTracker {
    database: DB<ITokenTrackerData> = new DB();
    provider: unknown;
    DONATION_ACCOUNT = Deno.env.get("donation_account") || ""
    supportedTokens: Map<address, Contract> = new Map();
    readonly topicSets = {
        topics: [
            utils.id("Transfer(address,address,uint256)"),
            null,
            utils.hexZeroPad(this.DONATION_ACCOUNT, 32),
        ]
    }
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
        return this.database.userTokenBalances[user]?.[token]?.value || 0;
    }

    addToken(token: string){
        const contract = new ethers.Contract(token, ERC20, this.provider);
        this.supportedTokens.set(token, contract);
        this.processPastEvents(token).then(()=>{
            contract.on(
                this.topicSets,
                (from: string, _: string, value: string, event: ILogEvent)=>this.processTransaction(from, value, event)
            );
        });
        return this;
    }

    processTransaction(from: string, value: string, {blockNumber, address}: ILogEvent){
        if(blockNumber > this.database.lastProcessedBlock){
            ((this.database.userTokenBalances[from] ??= {})[address] ??= {value: 0}).value += Number(value); // lol sns
            this.database.lastProcessedBlock = blockNumber;
            console.log(`[+] Received new transaction from: ${from}`);
        }
    }

    private async processPastEvents(token: string){
        const contract = new ethers.Contract(token, ERC20, this.provider);
        for(const event of await contract.queryFilter(this.topicSets)){
            this.processTransaction(event.args[0], event.data, event);
        }
    }
}



export const tokenTracker = Singleton(()=> new TokenTracker()).getInstance();