import * as z from "zod"

export function formatError(error: Error): string {
    let detail
    if (error instanceof z.ZodError) {
        detail = z.treeifyError(error).errors.join("\n")
    }
    return `${error.name}: ${error.message}${detail ? `\n${detail}` : ""}${error.stack ? `\n${error.stack}` : ""}`
}

export function logError(error: Error): void {
    console.error(formatError(error))
}
