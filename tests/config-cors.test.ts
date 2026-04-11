import {dispatch} from "#src/dispatch"
import {method} from "#src/method"
import {cors} from "#src/middleware"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it} from "vitest"

const context = {} as Context

const event = {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: "/",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: "/",
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
} satisfies APIGatewayProxyEvent

describe("cors middleware", () => {
    it("adds Access-Control headers to response", async () => {
        const route = method()
            .use(cors({"Allow-Origin": "*", "Allow-Methods": "GET,POST"}))
            .handle(async () => "ok")
        const result = await dispatch(route, event, context)
        expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("*")
        expect(result.headers?.["Access-Control-Allow-Methods"]).toBe("GET,POST")
    })

    it("does not add cors headers when no middleware used", async () => {
        const route = method().handle(async () => "ok")
        const result = await dispatch(route, event, context)
        const keys = Object.keys(result.headers ?? {})
        expect(keys.some((k) => k.startsWith("Access-Control"))).toBe(false)
    })

    it("applies multiple cors middlewares in order", async () => {
        const route = method()
            .use(cors({"Allow-Origin": "*"}))
            .use(cors({"Allow-Methods": "GET"}))
            .handle(async () => "ok")
        const result = await dispatch(route, event, context)
        expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("*")
        expect(result.headers?.["Access-Control-Allow-Methods"]).toBe("GET")
    })
})
