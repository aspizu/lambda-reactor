import {cors} from "#src/cors"
import {createHandler} from "#src/handler"
import {Method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it} from "vitest"

function event(httpMethod: string): APIGatewayProxyEvent {
    return {
        body: null,
        headers: {},
        httpMethod,
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: null,
        path: "/",
        pathParameters: null,
        queryStringParameters: null,
        requestContext: {} as APIGatewayProxyEvent["requestContext"],
        resource: "/",
        stageVariables: null,
    }
}

const context = {} as Context

describe("cors middleware", () => {
    it("adds Access-Control headers to response", async () => {
        const handler = createHandler({
            GET: new Method()
                .use(cors().allowMethods("GET", "POST").allowOrigin("*").toMiddleware())
                .handle(async () => "ok"),
        })
        const result = await handler(event("GET"), context)
        expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("*")
        expect(result.headers?.["Access-Control-Allow-Methods"]).toBe("GET, POST")
    })

    it("does not add cors headers when no middleware used", async () => {
        const handler = createHandler({
            GET: new Method().handle(async () => "ok"),
        })
        const result = await handler(event("GET"), context)
        const keys = Object.keys(result.headers ?? {})
        expect(keys.some((k) => k.startsWith("Access-Control"))).toBe(false)
    })

    it("applies multiple cors middlewares in order", async () => {
        const handler = createHandler({
            GET: new Method()
                .use(cors().allowOrigin("*").toMiddleware())
                .use(cors().allowMethods("GET").toMiddleware())
                .handle(async () => "ok"),
        })
        const result = await handler(event("GET"), context)
        expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("*")
        expect(result.headers?.["Access-Control-Allow-Methods"]).toBe("GET")
    })
})
