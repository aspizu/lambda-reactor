import {readFileSync} from "fs"
import {join} from "path"

import {Duration} from "aws-cdk-lib"
import type {RestApi} from "aws-cdk-lib/aws-apigateway"
import {
    type CorsOptions,
    LambdaIntegration,
    ResponseType,
} from "aws-cdk-lib/aws-apigateway"
import type {IFunction} from "aws-cdk-lib/aws-lambda"

import type {CORS} from "./cors"

function _toCorsOptions(cors: CORS): CorsOptions {
    const opts = cors._toCorsOptions()
    return {
        ...opts,
        maxAge: opts.maxAge !== undefined ? Duration.seconds(opts.maxAge) : undefined,
    }
}

function _getMethods(src: string): string[] {
    const match = src.match(/createHandler\(\{([^}]*)\}\)/)?.[1]
    if (!match) return []
    return match.split(",").map((s) => s.trim())
}

export type FunctionFactory = (entry: string, id: string) => IFunction

export class Router<TPaths extends string = never> {
    private _cors?: CORS
    private _paths: string[] = []
    private _srcDir: string

    /**
     * @param opts.cors   - Optional CORS configuration applied to every route.
     * @param opts.srcDir - Directory that contains the per-route source files
     *   read by {@link defineRestApi} to discover HTTP methods.  Defaults to
     *   `"src/api"`.
     */
    constructor(opts: {cors?: CORS; srcDir?: string} = {}) {
        this._cors = opts.cors
        this._srcDir = opts.srcDir ?? "src/api"
    }

    /**
     * Wires all registered routes into the given API Gateway REST API.
     *
     * @param api     - The CDK `RestApi` to attach resources and methods to.
     * @param factory - {@link FunctionFactory} used to build Lambda functions.
     * @returns A record mapping each route path to its {@link IFunction}.
     */
    defineRestApi(api: RestApi, factory: FunctionFactory): Record<TPaths, IFunction> {
        const handlers = Object.fromEntries(
            this._paths.map((path) => [
                path,
                factory(join(this._srcDir, `${path}.ts`), path),
            ]),
        ) as Record<TPaths, IFunction>
        for (const [path, fn] of Object.entries(handlers) as [string, IFunction][]) {
            const resource = path
                .split("/")
                .filter(Boolean)
                .reduce(
                    (r, part) => r.getResource(part) ?? r.addResource(part),
                    api.root,
                )
            if (this._cors) {
                resource.addCorsPreflight(_toCorsOptions(this._cors))
                api.addGatewayResponse("Default4xxCors", {
                    type: ResponseType.DEFAULT_4XX,
                    responseHeaders: this._cors._toGatewayResponseHeaders(),
                })
                api.addGatewayResponse("Default5xxCors", {
                    type: ResponseType.DEFAULT_5XX,
                    responseHeaders: this._cors._toGatewayResponseHeaders(),
                })
            }
            const src = readFileSync(join(this._srcDir, `${path}.ts`), "utf-8")
            for (const method of _getMethods(src)) {
                resource.addMethod(method, new LambdaIntegration(fn))
                if (this._cors) {
                    resource.addMethod("OPTIONS", new LambdaIntegration(fn))
                }
            }
        }
        return handlers
    }

    /**
     * Registers a new route path to this router.
     *
     * @param path - Route path string (e.g. `"/users"`).  Must correspond to a handler file at `<srcDir>/<path>.ts`.
     */
    route<TPath extends string>(path: TPath): Router<TPath | TPaths> {
        this._paths = [...this._paths, path]
        return this as unknown as Router<TPath | TPaths>
    }
}
