import {logError} from "#src/logger"
import {RouteHandler} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {z} from "zod"

import {applyMiddlewares} from "./middleware"

/**
 * Executes a single {@link RouteHandler} for an incoming Lambda proxy event.
 *
 * Processing order:
 * 1. Parse `event.body` as JSON when possible.
 * 2. Validate the body against `route.bodySchema` (Zod); return `400` on
 *    failure.
 * 3. Invoke `route.callback` with the validated body, event, and context.
 * 4. If the callback returns a {@link Response}, optionally validate its body
 *    against `route.outputSchema`; return `500` on failure.
 * 5. If the callback returns a plain value, wrap it in a `200 JSON` response,
 *    optionally validating against `route.outputSchema`.
 * 6. Apply all middlewares left-to-right before returning.
 *
 * @param route   - The route handler to execute.
 * @param event   - Raw API Gateway proxy event.
 * @param context - Lambda execution context.
 */
export async function dispatch(
    route: RouteHandler,
    event: APIGatewayProxyEvent,
    context: Context,
) {
    let body
    try {
        body = event.body ? JSON.parse(event.body) : undefined
    } catch (error) {
        if (error instanceof Error) {
            return Response.text(400, error.message).toAPIGatewayProxyResult()
        }
        throw error
    }
    if (route.bodySchema) {
        const parsed = route.bodySchema.safeParse(body)
        if (!parsed.success) {
            return Response.text(
                400,
                z.treeifyError(parsed.error).errors.join("\n"),
            ).toAPIGatewayProxyResult()
        }
        body = parsed.data
    }
    if (!route.callback) {
        const err = new Error("Route has no handler defined")
        logError(err)
        return Response.text(500, err.message).toAPIGatewayProxyResult()
    }
    const cb = route.callback as (props: {
        body: unknown
        event: APIGatewayProxyEvent
        context: Context
    }) => Promise<unknown>
    const result = await cb({body, event, context})
    if (result instanceof Response) {
        if (route.outputSchema) {
            const parsed = route.outputSchema.safeParse(result.body)
            if (!parsed.success) {
                logError(parsed.error)
                return Response.text(
                    500,
                    z.treeifyError(parsed.error).errors.join("\n"),
                ).toAPIGatewayProxyResult()
            }
            result.body = parsed.data
        }
        return applyMiddlewares(result.toAPIGatewayProxyResult(), route)
    }
    if (route.outputSchema) {
        const parsed = route.outputSchema.safeParse(result)
        if (!parsed.success) {
            logError(parsed.error)
            return Response.text(
                500,
                z.treeifyError(parsed.error).errors.join("\n"),
            ).toAPIGatewayProxyResult()
        }
        return applyMiddlewares(
            Response.json(200, parsed.data).toAPIGatewayProxyResult(),
            route,
        )
    }
    return applyMiddlewares(Response.json(200, result).toAPIGatewayProxyResult(), route)
}
