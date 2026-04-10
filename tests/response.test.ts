import {Response} from "#src/response"
import {describe, expect, it} from "vitest"

describe("Response", () => {
    it("serializes json bodies", () => {
        expect(
            Response.json(201, {ok: true})
                .header("X-Test", "1")
                .toAPIGatewayProxyResult(),
        ).toEqual({
            statusCode: 201,
            body: JSON.stringify({ok: true}),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "X-Test": "1",
            },
        })
    })

    it("serializes text bodies", () => {
        expect(Response.text(400, "nope").toAPIGatewayProxyResult()).toEqual({
            statusCode: 400,
            body: "nope",
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        })
    })
})
