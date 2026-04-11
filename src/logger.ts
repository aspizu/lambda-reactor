import * as z from "zod"

/**
 * Formats an `Error` into a human-readable string that includes the error
 * name, message, an optional Zod validation detail block, and the stack
 * trace when available.
 */
export function formatError(error: Error): string {
    let detail = error.message
    if (error instanceof z.ZodError) {
        detail = z.prettifyError(error)
    }
    return `${error.name}: ${detail}${error.stack ? `\n${error.stack.slice(error.name.length + error.message.length + 3)}` : ""}`
}

/** Writes a formatted error to `stderr` via `console.error`. */
export function logError(error: Error): void {
    console.error(formatError(error))
}
