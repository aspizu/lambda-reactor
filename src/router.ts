import {readFileSync} from "fs"
import {join} from "path"

import {Duration} from "aws-cdk-lib"
import type {Integration, IResource, Method, RestApi} from "aws-cdk-lib/aws-apigateway"
import {
    type CorsOptions,
    LambdaIntegration,
    ResponseType,
} from "aws-cdk-lib/aws-apigateway"
import type {IFunction} from "aws-cdk-lib/aws-lambda"
import type {Construct} from "constructs"

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
    (scope: Construct, path: TPaths, entry: string): IFunction
}
export interface ResourceFactory<TPaths extends string = never> {
    (api: RestApi, path: TPaths, part: string): IResource
}
export interface MethodFactory<TPaths extends string = never> {
    (
        resource: IResource,
        path: TPaths,
        method: string,
        integration: Integration,
    ): Method
}

export class Router<TPaths extends string = never> {
    private _cors?: CORS
    private _paths: string[] = []
    private _srcDir: string
    private _functionFactory: FunctionFactory<TPaths>
    private _methodFactory: MethodFactory<TPaths>

    /**
     * @param opts.cors   - Optional CORS configuration applied to every route.
     * @param opts.srcDir - Directory that contains the per-route source files. Defaults to `"src/api"`.
     * @param opts.functionFactory - {@link FunctionFactory} used to build Lambda functions.
     * @param opts.methodFactory - {@link MethodFactory} used to build API Gateway methods. Defaults to `resource.addMethod(method, integration)`.
     */
    constructor(opts: {
        cors?: CORS
        srcDir?: string
        functionFactory: FunctionFactory<TPaths>
        methodFactory: MethodFactory<TPaths>
    }) {
        this._cors = opts.cors
        this._srcDir = opts.srcDir ?? "src/api"
        this._functionFactory = opts.functionFactory
        this._methodFactory = opts.methodFactory
    }

    /**
     * Wires all registered routes into the given API Gateway REST API.
     *
     * @param api     - The CDK `RestApi` to attach resources and methods to.
     * @returns A record mapping each route path to its {@link IFunction}.
     */
    defineRestApi(scope: Construct, api: RestApi): Record<TPaths, IFunction> {
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
            const fn = this._functionFactory(scope, path as TPaths, entry)
            return [path, fn] as [TPaths, IFunction]
        })
        for (const [path, fn] of handlers) {
            const parts = path.split("/").filter(Boolean)
            const resource = parts.reduce((r, part) => {
                return r.getResource(part) ?? r.addResource(part)
            }, api.root)
            const src = readFileSync(join(this._srcDir, `${path}.ts`), "utf-8")
            for (const method of _getMethods(src)) {
                this._methodFactory(
                    resource,
                    path as TPaths,
                    method,
                    new LambdaIntegration(fn),
                )
            }
            if (this._cors) {
                resource.addCorsPreflight(_toCorsOptions(this._cors))
                this._methodFactory(
                    resource,
                    path as TPaths,
                    "OPTIONS",
                    new LambdaIntegration(fn),
                )
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
