/**
 * Attaches proxies to all nested object including the containing object.
 * @param obj the object to proxy recursively.
 * @param callBack method that is executed when a change happens
 * @returns the proxied object
 */
export function decorateAccessors<T extends Record<string, unknown>>(
    obj: T,
    callBack: (val: unknown) => void
) {
    Object.entries(obj).forEach(([key, val]) => {
        if (typeof val === "object") {
            // deno-lint-ignore no-explicit-any
            (obj[key] as unknown) = decorateAccessors(val as any, callBack);
        }
    });
    return new Proxy(obj, {
        set: (obj, modifiedKey, value) => {
            Reflect.set(obj, modifiedKey, value);
            callBack(value);
            return true;
        },
    });
}