import {createHandler} from "#src/handler"
import {Method} from "#src/method"
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

describe("createHandler validation", () => {
    it("validates input and returns 400 on bad input", async () => {
        const handler = createHandler({
            POST: new Method()
                .input(z.object({username: z.string()}))
                .handle(({body}) => ({username: body.username})),
        })
        const invalid = await handler(event("POST", {username: 7}), context)
        expect(invalid).toMatchObject({
            headers: {"Content-Type": "text/plain; charset=utf-8"},
            statusCode: 400,
        })
    })

    it("validates output schema and returns json on success", async () => {
        const handler = createHandler({
            POST: new Method()
                .input(z.object({username: z.string()}))
                .output(z.object({username: z.string()}))
                .handle(({body}) => ({username: body.username})),
        })
        await expect(
            handler(event("POST", {username: "neo"}), context),
        ).resolves.toEqual({
            body: JSON.stringify({username: "neo"}),
            headers: {"Content-Type": "application/json; charset=utf-8"},
            statusCode: 200,
        })
    })

    it("validates output schema against Response body and returns 500 on mismatch", async () => {
        const handler = createHandler({
            POST: new Method()
                .output(z.object({username: z.string()}))
                .handle(() => Response.json(200, {username: 42})),
        })
        const result = await handler(event("POST"), context)
        expect(result).toMatchObject({
            headers: {"Content-Type": "text/plain; charset=utf-8"},
            statusCode: 500,
        })
    })

    it("validates output schema against Response body and passes on match", async () => {
        const handler = createHandler({
            POST: new Method()
                .output(z.object({username: z.string()}))
                .handle(() => Response.json(201, {username: "neo"})),
        })
        const result = await handler(event("POST"), context)
        expect(result).toEqual({
            body: JSON.stringify({username: "neo"}),
            headers: {"Content-Type": "application/json; charset=utf-8"},
            statusCode: 201,
        })
    })
})
