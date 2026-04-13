import * as z from "zod"

export function _formatError(error: Error): string {
    let detail = error.message
    if (error instanceof z.ZodError) {
        detail = z.prettifyError(error)
    }
    return `${error.name}: ${detail}${error.stack ? `\n${error.stack.slice(error.name.length + error.message.length + 3)}` : ""}`
}

export function _logError(error: Error): void {
    console.error(_formatError(error))
}
