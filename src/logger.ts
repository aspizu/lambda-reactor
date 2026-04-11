import * as z from "zod"

/**
 * Formats an `Error` into a human-readable string that includes the error
 * name, message, an optional Zod validation detail block, and the stack
 * trace when available.
 */
export function formatError(error: Error): string {
    let detail
    if (error instanceof z.ZodError) {
        detail = z.treeifyError(error).errors.join("\n")
    }
    return `${error.name}: ${error.message}${detail ? `\n${detail}` : ""}${error.stack ? `\n${error.stack}` : ""}`
}

/** Writes a formatted error to `stderr` via `console.error`. */
export function logError(error: Error): void {
    console.error(formatError(error))
}
