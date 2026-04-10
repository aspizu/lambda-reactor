import {logError} from "#src/logger"
import {RouteHandler} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {z} from "zod"

function parseJson(value: unknown) {
    if (typeof value !== "string") return value
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export async function dispatch(
    route: RouteHandler,
    event: APIGatewayProxyEvent,
    context: Context,
) {
    let body = parseJson(event.body)
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
        logError(new Error("Route has no callback"))
        return Response.text(500, "Internal Server Error").toAPIGatewayProxyResult()
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
                    "Internal Server Error",
                ).toAPIGatewayProxyResult()
            }
            result.body = parsed.data
        }
        return result.toAPIGatewayProxyResult()
    }
    if (route.outputSchema) {
        const parsed = route.outputSchema.safeParse(result)
        if (!parsed.success) {
            logError(parsed.error)
            return Response.text(500, "Internal Server Error").toAPIGatewayProxyResult()
        }
        return Response.json(200, parsed.data).toAPIGatewayProxyResult()
    }
    return Response.json(200, result).toAPIGatewayProxyResult()
}
