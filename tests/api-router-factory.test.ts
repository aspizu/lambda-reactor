import {join} from "path"

import type {IRestApi} from "aws-cdk-lib/aws-apigateway"
import type {IFunction} from "aws-cdk-lib/aws-lambda"
import {beforeEach, describe, expect, it, vi} from "vitest"

vi.mock("fs", () => ({readFileSync: vi.fn()}))
vi.mock("aws-cdk-lib/aws-apigateway", () => ({
    LambdaIntegration: vi.fn(),
}))

describe("router defineRestApi factory overload", () => {
    beforeEach(async () => {
        const {readFileSync} = await import("fs")
        ;(readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(
            `export const handler = createHandler({GET})`,
        )
    })

    it("accepts a factory and returns a record keyed by path", async () => {
        const {router} = await import("#src/router")
        const fakeResource = {
            getResource: () => undefined,
            addResource: () => fakeResource,
            addMethod: vi.fn(),
        }
        const api = {root: fakeResource} as unknown as IRestApi
        const factory = vi.fn(
            (entry: string, id: string) => ({entry, id}) as unknown as IFunction,
        )
        const result = router()
            .route("/user/{user_id}")
            .route("/posts")
            .defineRestApi(api, factory)
        expect(factory).toHaveBeenCalledWith(
            join(process.cwd(), "src", "/user/{user_id}.ts"),
            "/user/{user_id}",
        )
        expect(factory).toHaveBeenCalledWith(
            join(process.cwd(), "src", "/posts.ts"),
            "/posts",
        )
        expect(Object.keys(result)).toEqual(["/user/{user_id}", "/posts"])
        expect(result).not.toBe(api)
    })
})
