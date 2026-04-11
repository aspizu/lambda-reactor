import {dispatch} from "#src/dispatch"
import {isProduction} from "#src/env"
import {formatError, logError} from "#src/logger"
import {RouteHandler} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {install} from "source-map-support"

install()

/**
 * Creates an AWS Lambda handler function from a map of HTTP-method names to
 * {@link RouteHandler} instances.
 *
 * The returned handler:
 * - Returns `405 Method Not Allowed` (with an `Allow` header) for any HTTP
 *   method not present in `routes`.
 * - Delegates matching requests to {@link dispatch}.
 * - Catches any `Error` thrown by `dispatch`, logs it, and returns
 *   `500 Internal Server Error`.  In non-production environments the error
 *   message and stack trace are included in the response body.
 * - Re-throws non-`Error` throwables so they propagate to the Lambda runtime.
 *
 * @param routes - Map of upper-case HTTP method names (e.g. `"GET"`, `"POST"`)
 *   to their corresponding {@link RouteHandler}.
 *
 * @example
 * ```ts
 * export const handler = createHandler({
 *   GET: method().handle(async () => Response.json(200, {ok: true})),
 * })
 * ```
 */
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
