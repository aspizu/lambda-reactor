import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {z} from "zod"

import {_logError} from "./_logger"
import type {_RouteHandler} from "./_route-handler"
import {_applyMiddlewares} from "./middleware"
import {Response} from "./response"

export async function _dispatch(
    route: _RouteHandler,
    event: APIGatewayProxyEvent,
    context: Context,
) {
    let body
    try {
        body = event.body ? JSON.parse(event.body) : undefined
    } catch (error) {
        if (error instanceof Error) {
            return Response.text(400, error.message)._toAPIGatewayProxyResult()
        }
        throw error
    }
    if (route.bodySchema) {
        const parsed = route.bodySchema.safeParse(body)
        if (!parsed.success) {
            return Response.text(
                400,
                z.prettifyError(parsed.error),
            )._toAPIGatewayProxyResult()
        }
        body = parsed.data
    }
    if (!route.callback) {
        const err = new Error("Route has no handler defined")
        _logError(err)
        return Response.text(500, err.message)._toAPIGatewayProxyResult()
    }
    const cb = route.callback as (props: {
        body: unknown
        context: Context
        event: APIGatewayProxyEvent
    }) => Promise<unknown>
    const result = await cb({body, context, event})
    const apiResult =
        result instanceof Response ?
            result._toAPIGatewayProxyResult()
        :   Response.json(200, result)._toAPIGatewayProxyResult()
    const middlewaredResult = _applyMiddlewares(apiResult, route)
    if (route.outputSchema) {
        let parsedBody: unknown
        try {
            parsedBody = JSON.parse(middlewaredResult.body)
        } catch {
            const err = new Error("Response body is not valid JSON")
            _logError(err)
            return Response.text(500, err.message)._toAPIGatewayProxyResult()
        }
        const validation = route.outputSchema.safeParse(parsedBody)
        if (!validation.success) {
            _logError(validation.error)
            return Response.text(
                500,
                z.prettifyError(validation.error),
            )._toAPIGatewayProxyResult()
        }
    }
    return middlewaredResult
}
