import {readFileSync} from "fs"
import {join} from "path"

import {Duration} from "aws-cdk-lib"
import type {IResource, RestApi} from "aws-cdk-lib/aws-apigateway"
import {
    type CorsOptions,
    LambdaIntegration,
    ResponseType,
} from "aws-cdk-lib/aws-apigateway"
import type {IFunction} from "aws-cdk-lib/aws-lambda"

import type {CORS} from "./cors"

function _toCorsOptions(cors: CORS): CorsOptions {
    const opts = cors._toCorsOptions()
    const maxAge = opts.maxAge !== undefined ? Duration.seconds(opts.maxAge) : undefined
    return {...opts, maxAge}
}

function _getMethods(src: string): string[] {
    const match = src.match(/createHandler\(\{([^}]*)\}\)/)?.[1]
    if (!match) return []
    return match.split(",").map((s) => s.trim())
}

export interface FunctionFactory<TPaths extends string = never> {
    (path: TPaths, entry: string): IFunction
}
export interface ResourceFactory<TPaths extends string = never> {
    (api: RestApi, path: TPaths, part: string): IResource
}

export class Router<TPaths extends string = never> {
    private _cors?: CORS
    private _paths: string[] = []
    private _srcDir: string
    private _functionFactory: FunctionFactory<TPaths>
    private _resourceFactory: ResourceFactory<TPaths>

    /**
     * @param opts.cors   - Optional CORS configuration applied to every route.
     * @param opts.srcDir - Directory that contains the per-route source files. Defaults to `"src/api"`.
     * @param opts.functionFactory - {@link FunctionFactory} used to build Lambda functions.
     * @param opts.resourceFactory - {@link ResourceFactory} used to build API Gateway resources.
     */
    constructor(opts: {
        cors?: CORS
        srcDir?: string
        functionFactory: FunctionFactory<TPaths>
        resourceFactory: ResourceFactory<TPaths>
    }) {
        this._cors = opts.cors
        this._srcDir = opts.srcDir ?? "src/api"
        this._functionFactory = opts.functionFactory
        this._resourceFactory = opts.resourceFactory
    }

    /**
     * Wires all registered routes into the given API Gateway REST API.
     *
     * @param api     - The CDK `RestApi` to attach resources and methods to.
     * @returns A record mapping each route path to its {@link IFunction}.
     */
    defineRestApi(api: RestApi): Record<TPaths, IFunction> {
        if (this._cors) {
            api.addGatewayResponse("Default4xxCors", {
                type: ResponseType.DEFAULT_4XX,
                responseHeaders: this._cors._toGatewayResponseHeaders(),
            })
            api.addGatewayResponse("Default5xxCors", {
                type: ResponseType.DEFAULT_5XX,
                responseHeaders: this._cors._toGatewayResponseHeaders(),
            })
        }
        const handlers = this._paths.map((path) => {
            const entry = join(this._srcDir, `${path}.ts`)
            const fn = this._functionFactory(path as TPaths, entry)
            return [path, fn] as [TPaths, IFunction]
        })
        for (const [path, fn] of handlers) {
            const parts = path.split("/").filter(Boolean)
            const resource = parts.reduce((r, part) => {
                return r.getResource(part) ?? this._resourceFactory(api, path, part)
            }, api.root)
            const src = readFileSync(join(this._srcDir, `${path}.ts`), "utf-8")
            for (const method of _getMethods(src)) {
                resource.addMethod(method, new LambdaIntegration(fn))
            }
            if (this._cors) {
                resource.addCorsPreflight(_toCorsOptions(this._cors))
                resource.addMethod("OPTIONS", new LambdaIntegration(fn))
            }
        }
        return Object.fromEntries(handlers) as Record<TPaths, IFunction>
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
