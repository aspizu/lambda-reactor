import {Router} from "#src/router-class"

export {Router}

/**
 * Extracts the HTTP method names declared inside a `createHandler({…})` call
 * by statically scanning the source text of a handler file.
 *
 * @param src - Raw TypeScript source of a handler module.
 * @returns Array of upper-case HTTP method names (e.g. `["GET", "POST"]`),
 *   or an empty array when no `createHandler` call is found.
 */
export function getMethods(src: string): string[] {
    const match = src.match(/createHandler\(\{([^}]*)\}\)/)
    if (!match || !match[1]) return []
    return match[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
}

/**
 * Creates a new, empty {@link Router} builder.
 *
 * @param srcDir - Directory (relative to `cwd`) where handler `.ts` files
 *   live.  Defaults to `"src"`.
 */
export function router(srcDir: string = "src"): Router {
    return new Router(srcDir)
}
