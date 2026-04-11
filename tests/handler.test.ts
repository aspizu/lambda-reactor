import {createHandler} from "#src/handler"
import {method} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it, vi} from "vitest"

vi.mock("source-map-support", () => ({install: vi.fn()}))

function event(httpMethod: string): APIGatewayProxyEvent {
    return {
        body: null,
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

describe("createHandler", () => {
    it("passes through Response instances", async () => {
        const callback = vi.fn(() => Response.text(204, ""))
        const handler = createHandler({GET: method().handle(callback)})
        await expect(handler(event("GET"), context)).resolves.toEqual({
            statusCode: 204,
            body: "",
            headers: {"Content-Type": "text/plain; charset=utf-8"},
        })
        expect(callback).toHaveBeenCalledOnce()
    })

    it("returns 500 when callback is not defined", async () => {
        const handler = createHandler({GET: method()})
        await expect(handler(event("GET"), context)).resolves.toEqual({
            statusCode: 500,
            body: "Route has no handler defined",
            headers: {"Content-Type": "text/plain; charset=utf-8"},
        })
    })
})
