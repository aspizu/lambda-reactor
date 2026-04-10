import {readFileSync} from "fs"
import {join} from "path"

import {Router} from "#src/router"

export function getMethods(path: string): string[] {
    const src = readFileSync(join(process.cwd(), "src", `${path}.ts`), "utf-8")
    const match = src.match(/createHandler\(\{([^}]*)\}\)/)
    if (!match || !match[1]) return []
    return match[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
}

export const router = () => new Router()
