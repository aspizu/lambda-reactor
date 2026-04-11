import type {APIGatewayProxyResult} from "aws-lambda"

import {RouteHandler} from "./route-handler"

/**
 * A pure function that receives an {@link APIGatewayProxyResult} and returns
 * a (possibly modified) copy of it.  Middlewares are composed left-to-right
 * by {@link dispatch}.
 */
export type Middleware = (result: APIGatewayProxyResult) => APIGatewayProxyResult

/**
 * Creates a middleware that injects CORS response headers.
 *
 * Each key in `headers` is prefixed with `"Access-Control-"` before being
 * merged into the response, so passing `{"Allow-Origin": "*"}` produces the
 * `Access-Control-Allow-Origin: *` header.
 *
 * @param headers - Map of unprefixed CORS header names to their values.
 *   Defaults to an empty object (no CORS headers added).
 */
export function cors(headers: Record<string, string> = {}): Middleware {
    return (result) => {
        const corsHeaders: Record<string, string> = {}
        for (const [key, value] of Object.entries(headers)) {
            corsHeaders[`Access-Control-${key}`] = value
        }
        return {...result, headers: {...result.headers, ...corsHeaders}}
    }
}

/**
 * Folds all middlewares registered on `route` over `result`, applying them
 * left-to-right, and returns the final {@link APIGatewayProxyResult}.
 */
export function applyMiddlewares(
    result: APIGatewayProxyResult,
    route: RouteHandler,
): APIGatewayProxyResult {
    return route.middlewares.reduce((r, middleware) => middleware(r), result)
}
