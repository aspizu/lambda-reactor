import type {ZodType} from "zod"

import type {Middleware} from "./middleware"

export interface _RouteHandler {
    readonly bodySchema?: ZodType<unknown>
    readonly callback?: (props: never) => unknown
    readonly middlewares: Middleware[]
    readonly outputSchema?: ZodType<unknown>
}
