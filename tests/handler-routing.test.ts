import {createHandler} from "#src/handler"
import {method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it} from "vitest"

function event(httpMethod: string, body: unknown = undefined): APIGatewayProxyEvent {
    return {
        body:
            body === undefined ? null
            : typeof body === "string" ? body
            : JSON.stringify(body),
        headers: {},
        multiValueHeaders: {},
        httpMethod,
        isBase64Encoded: false,
        path: "/",
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        resource: "/",
        requestContext: {} as APIGatewayProxyEvent["requestContext"],
    }
}

const context = {} as Context

describe("createHandler routing", () => {
    it("returns 405 with allow header for unsupported methods", async () => {
        const handler = createHandler({GET: method().handle(() => ({ok: true}))})
        await expect(handler(event("POST"), context)).resolves.toEqual({
            statusCode: 405,
            body: "Method Not Allowed",
            headers: {"Content-Type": "text/plain; charset=utf-8", Allow: "GET"},
        })
    })
})
