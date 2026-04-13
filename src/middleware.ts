import type {APIGatewayProxyResult} from "aws-lambda"

import type {_RouteHandler} from "./_route-handler"

/**
 * A pure function that receives an {@link APIGatewayProxyResult} and returns
 * a (possibly modified) copy of it.  Middlewares are composed left-to-right
 * by {@link dispatch}.
 */
export type Middleware = (result: APIGatewayProxyResult) => APIGatewayProxyResult

export function _applyMiddlewares(
    result: APIGatewayProxyResult,
    route: _RouteHandler,
): APIGatewayProxyResult {
    return route.middlewares.reduce(
        (r: APIGatewayProxyResult, middleware: Middleware) => middleware(r),
        result,
    )
}
