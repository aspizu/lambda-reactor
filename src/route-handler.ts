import {type Middleware} from "#src/middleware"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import type {ZodType} from "zod"

/**
 * The user-supplied handler function for a single HTTP method on a route.
 *
 * @typeParam TInput  - Shape of the validated request body (after Zod parsing).
 * @typeParam TOutput - Shape of the value returned by the callback.
 */
export type EndpointCallback<TInput, TOutput> = (props: {
    body: TInput
    event: APIGatewayProxyEvent
    context: Context
}) => Promise<TOutput | Response> | TOutput | Response

/**
 * Internal read-only view of a {@link Method} used by {@link dispatch} and
 * {@link createHandler}.  The type parameters are erased so that handlers for
 * different routes can be stored in the same map.
 */
export interface RouteHandler {
    readonly middlewares: Middleware[]
    readonly bodySchema?: ZodType<unknown>
    readonly outputSchema?: ZodType<unknown>
    readonly callback?: (props: never) => unknown
}
