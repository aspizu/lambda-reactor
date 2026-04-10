import {createHandler} from "#src/handler"
import {method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {afterEach, describe, expect, it, vi} from "vitest"

vi.mock("source-map-support", () => ({install: vi.fn()}))

const context = {} as Context

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

describe("createHandler error logging", () => {
    afterEach(() => {
        delete process.env["NODE_ENV"]
    })

    it("logs the error message and returns it in the body outside production", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
        const boom = new Error("boom")
        const handler = createHandler({
            GET: method().handle(() => {
                throw boom
            }),
        })
        const result = await handler(event("GET"), context)
        expect(result.statusCode).toBe(500)
        expect(result.body).toContain("boom")
        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("boom"))
        consoleError.mockRestore()
    })

    it("returns generic message in production", async () => {
        process.env["NODE_ENV"] = "production"
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
        const handler = createHandler({
            GET: method().handle(() => {
                throw new Error("secret details")
            }),
        })
        const result = await handler(event("GET"), context)
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe("Internal Server Error")
        expect(result.body).not.toContain("secret details")
        consoleError.mockRestore()
    })
})
