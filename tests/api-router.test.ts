import {join} from "path"

import type {IRestApi} from "aws-cdk-lib/aws-apigateway"
import type {IFunction} from "aws-cdk-lib/aws-lambda"
import {beforeEach, describe, expect, it, vi} from "vitest"

vi.mock("fs", () => ({readFileSync: vi.fn()}))

const LambdaIntegration = vi.fn(function (this: {handler: unknown}, handler: unknown) {
    this.handler = handler
})

vi.mock("aws-cdk-lib/aws-apigateway", () => ({LambdaIntegration}))

class FakeResource {
    children = new Map<string, FakeResource>()
    methods: {method: string; integration: unknown}[] = []
    getResource(part: string) {
        return this.children.get(part)
    }
    addResource(part: string) {
        const child = new FakeResource()
        this.children.set(part, child)
        return child
    }
    addMethod(method: string, value: unknown) {
        this.methods.push({method, integration: value})
        return this
    }
}

describe("router defineRestApi", () => {
    beforeEach(async () => {
        LambdaIntegration.mockClear()
        vi.resetModules()
        const {readFileSync} = await import("fs")
        vi.mocked(readFileSync).mockReturnValue(
            `export const handler = createHandler({GET, POST})`,
        )
    })

    it("defines nested rest resources on an existing api instance", async () => {
        const {router} = await import("#src/router")
        const root = new FakeResource()
        const api = {root} as unknown as IRestApi
        const getUser = {name: "getUser"} as unknown as IFunction
        const createPost = {name: "createPost"} as unknown as IFunction
        const factory = vi.fn((_entry: string, id: string) => {
            if (id === "/user/{user_id}") return getUser
            return createPost
        })
        router().route("/user/{user_id}").route("/posts").defineRestApi(api, factory)
        expect(factory).toHaveBeenCalledWith(
            join(process.cwd(), "src", "/user/{user_id}.ts"),
            "/user/{user_id}",
        )
        expect(factory).toHaveBeenCalledWith(
            join(process.cwd(), "src", "/posts.ts"),
            "/posts",
        )
        expect(LambdaIntegration).toHaveBeenCalledWith(getUser)
        expect(LambdaIntegration).toHaveBeenCalledWith(createPost)
        const user = root.getResource("user")
        expect(user?.getResource("{user_id}")?.methods).toEqual([
            {method: "GET", integration: {handler: getUser}},
            {method: "POST", integration: {handler: getUser}},
        ])
        expect(root.getResource("posts")?.methods).toEqual([
            {method: "GET", integration: {handler: createPost}},
            {method: "POST", integration: {handler: createPost}},
        ])
    })
})
