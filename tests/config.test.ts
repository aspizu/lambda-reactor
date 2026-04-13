import {createHandler} from "#src/handler"
import {Method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it} from "vitest"
import {z} from "zod"

function event(httpMethod: string, body: unknown = null): APIGatewayProxyEvent {
    return {
        body: body !== null ? JSON.stringify(body) : null,
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

describe("Method", () => {
    it("returns 400 on invalid input", async () => {
        const handler = createHandler({
            POST: new Method()
                .input(z.object({x: z.string()}))
                .handle(({body}) => body),
        })
        const result = await handler(event("POST"), context)
        expect(result.statusCode).toBe(400)
    })

    it("returns response from handler", async () => {
        const handler = createHandler({
            POST: new Method()
                .input(z.object({x: z.string()}))
                .handle(({body}) => ({x: body.x})),
        })
        const result = await handler(event("POST", {x: "hello"}), context)
        expect(result.statusCode).toBe(200)
    })
})
