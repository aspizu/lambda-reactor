import {readFileSync} from "fs"
import {join} from "path"

import {type CorsOptions, IRestApi, LambdaIntegration} from "aws-cdk-lib/aws-apigateway"
import {IFunction} from "aws-cdk-lib/aws-lambda"

import {buildHandlers, type FunctionFactory} from "./build-handlers"
import {getMethods} from "./router"

/**
 * Immutable CDK router that maps route paths to Lambda-backed API Gateway
 * resources.
 *
 * ```ts
 * const api = router()
 *   .cors({allowOrigins: ["*"]})
 *   .route("/users")
 *   .route("/items")
 *   .defineRestApi(restApi, factory)
 * ```
 *
 * @typeParam TPaths - Union of all route path strings registered so far.
 */
export class Router<TPaths extends string = never> {
    srcDir: string
    corsOptions?: CorsOptions
    paths: TPaths[] = []

    constructor(srcDir: string) {
        this.srcDir = srcDir
    }

    /**
     * Returns a new `Router` with CORS preflight options applied to every
     * resource added via {@link Router.route}.
     *
     * @param options - CDK `CorsOptions` passed to `addCorsPreflight`.
     */
    cors(options: CorsOptions): Router<TPaths> {
        const r = new Router<TPaths>(this.srcDir)
        r.corsOptions = options
        r.paths = this.paths
        return r
    }

    /**
     * Registers a new route path and returns a new `Router` with the path
     * added to its path union.
     *
     * @param path - Route path string (e.g. `"/users"`).  Must correspond to a
     *   handler file at `<srcDir>/<path>.ts`.
     */
    route<TPath extends string>(path: TPath): Router<TPaths | TPath> {
        const r = new Router<TPaths | TPath>(this.srcDir)
        if (this.corsOptions) r.corsOptions = this.corsOptions
        r.paths = [...this.paths, path as unknown as TPaths | TPath]
        return r
    }

    /**
     * Wires all registered routes into the given API Gateway REST API.
     *
     * For each route path the method:
     * 1. Creates (or reuses) nested API Gateway resources for each path segment.
     * 2. Optionally calls `addCorsPreflight` when CORS options are configured.
     * 3. Reads the handler source file and extracts HTTP method names via
     *    {@link getMethods}.
     * 4. Adds an `addMethod` entry backed by a `LambdaIntegration` for each
     *    discovered method.
     *
     * @param api     - The CDK `IRestApi` to attach resources and methods to.
     * @param factory - {@link FunctionFactory} used to build Lambda functions.
     * @returns A record mapping each route path to its {@link IFunction}.
     */
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
            if (this.corsOptions) resource.addCorsPreflight(this.corsOptions)
            const src = readFileSync(
                join(process.cwd(), this.srcDir, `${path}.ts`),
                "utf-8",
            )
            for (const method of getMethods(src)) {
                resource.addMethod(method, new LambdaIntegration(handlers[path]!))
            }
        }
        return handlers
    }
}
