import {createHandler} from "#src/handler"
import {Method} from "#src/method"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {afterEach, describe, expect, it, vi} from "vitest"

vi.mock("source-map-support", () => ({install: vi.fn()}))

const context = {} as Context

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

describe("createHandler error logging", () => {
    afterEach(() => {
        delete process.env["NODE_ENV"]
    })

    it("logs the error message and returns it in the body outside production", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
        const boom = new Error("boom")
        const handler = createHandler({
            GET: new Method().handle(() => {
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
            GET: new Method().handle(() => {
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
