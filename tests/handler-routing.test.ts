import {createHandler} from "#src/handler"
import {Method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it} from "vitest"

function event(httpMethod: string, body: unknown = undefined): APIGatewayProxyEvent {
    return {
        body:
            body === undefined ? null
            : typeof body === "string" ? body
            : JSON.stringify(body),
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

describe("createHandler routing", () => {
    it("returns 405 with allow header for unsupported methods", async () => {
        const handler = createHandler({GET: new Method().handle(() => ({ok: true}))})
        await expect(handler(event("POST"), context)).resolves.toEqual({
            body: "Method Not Allowed",
            headers: {Allow: "GET", "Content-Type": "text/plain; charset=utf-8"},
            statusCode: 405,
        })
    })
})
