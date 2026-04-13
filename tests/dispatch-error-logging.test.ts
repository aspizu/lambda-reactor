import {_dispatch} from "#src/_dispatch"
import {Method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it, vi} from "vitest"
import {z} from "zod"

const context = {} as Context

const event = {
    body: null,
    headers: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    path: "/",
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "/",
    stageVariables: null,
} satisfies APIGatewayProxyEvent

describe("dispatch error logging", () => {
    it("logs error when route has no callback", async () => {
        const logError = vi.spyOn(console, "error").mockImplementation(() => "")
        const route = new Method()
        await expect(_dispatch(route, event, context)).resolves.toMatchObject({
            statusCode: 500,
        })
        expect(logError).toHaveBeenCalled()
        logError.mockRestore()
    })

    it("logs error when output schema validation fails on Response body", async () => {
        const logError = vi.spyOn(console, "error").mockImplementation(() => "")
        const route = new Method()
            .output(z.object({n: z.number()}))
            .handle(() => ({n: "not-a-number"}) as unknown as {n: number})
        await expect(_dispatch(route, event, context)).resolves.toMatchObject({
            statusCode: 500,
        })
        expect(logError).toHaveBeenCalled()
        logError.mockRestore()
    })

    it("logs error when output schema validation fails on plain result", async () => {
        const logError = vi.spyOn(console, "error").mockImplementation(() => "")
        const route = new Method()
            .output(z.object({n: z.number()}))
            .handle(() =>
                Promise.resolve({n: "not-a-number"} as unknown as {n: number}),
            )
        await expect(_dispatch(route, event, context)).resolves.toMatchObject({
            statusCode: 500,
        })
        expect(logError).toHaveBeenCalled()
        logError.mockRestore()
    })
})
