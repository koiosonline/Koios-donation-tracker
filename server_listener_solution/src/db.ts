// deno-lint-ignore-file no-explicit-any
import { decorateAccessors } from "./utils/obj.ts";

interface IDBPolyfill {
    [x: string]: any
}

/**
 * Very simple dump-to-file db. you should probably change this in favor of whatever db you're using
 */
export class DB <T extends Record<string, any>> implements IDBPolyfill {
    readonly path: string;
    data: T; 
    constructor(path = "./src/db.json", autoSave = true){
        this.path = path;
        this.data = autoSave 
            ? decorateAccessors(JSON.parse(Deno.readTextFileSync(path)), ()=>this.save()) 
            : JSON.parse(Deno.readTextFileSync(path));
        // Makes accessing data properties much easier.
        Object.keys(this.data).forEach((name)=>{
            Object.defineProperty(this, name, {
                get: ( )=> this.data[name],
                set: (_)=> (this.data as Record<string, unknown>)[name] = _
            })
        })
    }

    [x: string]: any;

    save() {
        Deno.writeTextFileSync(this.path, JSON.stringify(this.data));
    }

}