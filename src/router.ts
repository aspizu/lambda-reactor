import {readFileSync} from "fs"
import {join} from "path"

import {buildHandlers, type FunctionFactory} from "#src/build-handlers"
import {IRestApi, LambdaIntegration} from "aws-cdk-lib/aws-apigateway"
import {IFunction} from "aws-cdk-lib/aws-lambda"

export function getMethods(src: string): string[] {
    const match = src.match(/createHandler\(\{([^}]*)\}\)/)
    if (!match || !match[1]) return []
    return match[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
}

export class Router<TPaths extends string = never> {
    paths: TPaths[] = []

    route<TPath extends string>(path: TPath): Router<TPaths | TPath> {
        const r = new Router<TPaths | TPath>()
        r.paths = [...this.paths, path as unknown as TPaths | TPath]
        return r
    }

    defineRestApi<TApi extends IRestApi>(
        api: TApi,
        factory: FunctionFactory,
    ): Record<TPaths, IFunction> {
        const handlers = buildHandlers(this.paths, factory)
        for (const path of this.paths) {
            const resource = path
                .split("/")
                .filter(Boolean)
                .reduce(
                    (r, part) => r.getResource(part) ?? r.addResource(part),
                    api.root,
                )
            const src = readFileSync(join(process.cwd(), "src", `${path}.ts`), "utf-8")
            for (const method of getMethods(src)) {
                resource.addMethod(method, new LambdaIntegration(handlers[path]!))
            }
        }
        return handlers
    }
}

export const router = () => new Router()
