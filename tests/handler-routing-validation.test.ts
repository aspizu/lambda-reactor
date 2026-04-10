import {createHandler} from "#src/handler"
import {method} from "#src/method"
import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import {describe, expect, it} from "vitest"
import {z} from "zod"

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

describe("createHandler validation", () => {
    it("validates input and returns 400 on bad input", async () => {
        const handler = createHandler({
            POST: method()
                .input(z.object({username: z.string()}))
                .handle(({body}) => ({username: body.username})),
        })
        const invalid = await handler(event("POST", {username: 7}), context)
        expect(invalid).toMatchObject({
            statusCode: 400,
            headers: {"Content-Type": "text/plain; charset=utf-8"},
        })
    })

    it("validates output schema and returns json on success", async () => {
        const handler = createHandler({
            POST: method()
                .input(z.object({username: z.string()}))
                .output(z.object({username: z.string()}))
                .handle(({body}) => ({username: body.username})),
        })
        await expect(
            handler(event("POST", {username: "neo"}), context),
        ).resolves.toEqual({
            statusCode: 200,
            body: JSON.stringify({username: "neo"}),
            headers: {"Content-Type": "application/json; charset=utf-8"},
        })
    })

    it("validates output schema against raw Response body and returns 500 on mismatch", async () => {
        const handler = createHandler({
            POST: method()
                .output(z.object({username: z.string()}))
                .handle(() => Response.json(200, {username: 42})),
        })
        const result = await handler(event("POST"), context)
        expect(result).toMatchObject({
            statusCode: 500,
            headers: {"Content-Type": "text/plain; charset=utf-8"},
        })
    })

    it("validates output schema against raw Response body and passes on match", async () => {
        const handler = createHandler({
            POST: method()
                .output(z.object({username: z.string()}))
                .handle(() => Response.json(201, {username: "neo"})),
        })
        const result = await handler(event("POST"), context)
        expect(result).toEqual({
            statusCode: 201,
            body: JSON.stringify({username: "neo"}),
            headers: {"Content-Type": "application/json; charset=utf-8"},
        })
    })
})
