import {method} from "#src/method"
import {cors} from "#src/middleware"
import {router} from "#src/router"
import {describe, expect, it} from "vitest"
import {z} from "zod"

describe("method middlewares", () => {
    it("has empty middlewares by default", () => {
        expect(method().middlewares).toEqual([])
    })

    it("adds middleware via .use()", () => {
        const m = cors({"Allow-Origin": "*"})
        expect(method().use(m).middlewares).toHaveLength(1)
    })

    it("accumulates multiple middlewares", () => {
        const m1 = cors({"Allow-Origin": "*"})
        const m2 = cors({"Allow-Methods": "GET"})
        expect(method().use(m1).use(m2).middlewares).toHaveLength(2)
    })

    it("propagates middlewares through input chain", () => {
        const m = cors({"Allow-Origin": "*"})
        expect(
            method()
                .use(m)
                .input(z.object({x: z.string()})).middlewares,
        ).toHaveLength(1)
    })

    it("propagates middlewares through output chain", () => {
        const m = cors({"Allow-Origin": "*"})
        expect(
            method()
                .use(m)
                .output(z.object({x: z.string()})).middlewares,
        ).toHaveLength(1)
    })

    it("propagates middlewares through handle chain", () => {
        const m = cors({"Allow-Origin": "*"})
        expect(
            method()
                .use(m)
                .handle(async () => "ok").middlewares,
        ).toHaveLength(1)
    })
})

describe("router srcDir", () => {
    it("defaults srcDir to src", () => {
        expect(router().srcDir).toBe("src")
    })

    it("accepts custom srcDir", () => {
        expect(router("src/api").srcDir).toBe("src/api")
    })

    it("propagates srcDir through route chain", () => {
        expect(router("src/api").route("/health").srcDir).toBe("src/api")
    })
})

describe("router cors", () => {
    it("stores corsOptions via .cors()", () => {
        const options = {allowOrigins: ["*"], allowMethods: ["GET"]}
        expect(router().cors(options).corsOptions).toEqual(options)
    })

    it("propagates corsOptions through route chain", () => {
        const options = {allowOrigins: ["*"], allowMethods: ["GET"]}
        expect(router().cors(options).route("/health").corsOptions).toEqual(options)
    })

    it("has no corsOptions by default", () => {
        expect(router().corsOptions).toBeUndefined()
    })
})
