import {dispatch} from "#src/dispatch"
import * as logger from "#src/logger"
import {method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it, vi} from "vitest"
import {z} from "zod"

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

describe("dispatch error logging", () => {
    it("logs error when route has no callback", async () => {
        const logError = vi.spyOn(logger, "logError").mockImplementation(() => "")
        const route = method()
        await expect(dispatch(route, event, context)).resolves.toMatchObject({
            statusCode: 500,
        })
        expect(logError).toHaveBeenCalledWith(expect.any(Error))
        logError.mockRestore()
    })

    it("logs error when output schema validation fails on Response body", async () => {
        const logError = vi.spyOn(logger, "logError").mockImplementation(() => "")
        const route = method()
            .output(z.object({n: z.number()}))
            .handle(() => ({n: "not-a-number"}) as unknown as {n: number})
        await expect(dispatch(route, event, context)).resolves.toMatchObject({
            statusCode: 500,
        })
        expect(logError).toHaveBeenCalled()
        logError.mockRestore()
    })

    it("logs error when output schema validation fails on plain result", async () => {
        const logError = vi.spyOn(logger, "logError").mockImplementation(() => "")
        const route = method()
            .output(z.object({n: z.number()}))
            .handle(() =>
                Promise.resolve({n: "not-a-number"} as unknown as {n: number}),
            )
        await expect(dispatch(route, event, context)).resolves.toMatchObject({
            statusCode: 500,
        })
        expect(logError).toHaveBeenCalled()
        logError.mockRestore()
    })
})
