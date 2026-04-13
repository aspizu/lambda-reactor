import {createHandler} from "#src/handler"
import {Method} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it, vi} from "vitest"

vi.mock("source-map-support", () => ({install: vi.fn()}))

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

describe("createHandler", () => {
    it("passes through Response instances", async () => {
        const callback = vi.fn(() => Response.text(204, ""))
        const handler = createHandler({GET: new Method().handle(callback)})
        await expect(handler(event("GET"), context)).resolves.toEqual({
            body: "",
            headers: {"Content-Type": "text/plain; charset=utf-8"},
            statusCode: 204,
        })
        expect(callback).toHaveBeenCalledOnce()
    })

    it("returns 500 when callback is not defined", async () => {
        const handler = createHandler({GET: new Method()})
        await expect(handler(event("GET"), context)).resolves.toEqual({
            body: "Route has no handler defined",
            headers: {"Content-Type": "text/plain; charset=utf-8"},
            statusCode: 500,
        })
    })
})
