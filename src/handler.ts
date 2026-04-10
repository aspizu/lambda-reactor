import {dispatch} from "#src/dispatch"
import {isProduction} from "#src/env"
import {formatError, logError} from "#src/logger"
import {RouteHandler} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {install} from "source-map-support"

install()

export function createHandler<T extends Record<string, RouteHandler>>(routes: T) {
    return async (
        event: APIGatewayProxyEvent,
        context: Context,
    ): Promise<APIGatewayProxyResult> => {
        const route = routes[event.httpMethod as keyof T]
        if (!route) {
            return Response.text(405, "Method Not Allowed")
                .header("Allow", Object.keys(routes).join(", "))
                .toAPIGatewayProxyResult()
        }
        try {
            return await dispatch(route, event, context)
        } catch (error) {
            if (error instanceof Error) {
                logError(error)
                return Response.text(
                    500,
                    isProduction() ? "Internal Server Error" : formatError(error),
                ).toAPIGatewayProxyResult()
            }
            throw error
        }
    }
}
