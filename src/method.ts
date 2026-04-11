import {type Middleware} from "#src/middleware"
import {EndpointCallback, RouteHandler} from "#src/route-handler"
import type {ZodType} from "zod"

export type {EndpointCallback, RouteHandler}

/**
 * Fluent, immutable builder for a single HTTP-method handler.
 *
 * Every method returns a new `Method` instance, leaving the original
 * unchanged.  Build a method with the following chain:
 *
 * ```ts
 * method().use(cors()).input(schema).output(schema).handle(async ({body}) => …)
 * ```
 *
 * @typeParam TInput  - Shape of the validated request body.
 * @typeParam TOutput - Return type of the handler callback.
 */
export class Method<TInput = unknown, TOutput = unknown> {
    middlewares: Middleware[] = []
    bodySchema?: ZodType<TInput>
    outputSchema?: ZodType<TOutput>
    callback?: EndpointCallback<TInput, TOutput>

    /**
     * Appends a middleware to the chain.  Middlewares are applied
     * left-to-right after the callback resolves.
     *
     * @param middleware - The {@link Middleware} to append.
     */
    use(middleware: Middleware): Method<TInput, TOutput> {
        const r = new Method<TInput, TOutput>()
        r.middlewares = [...this.middlewares, middleware]
        if (this.bodySchema) r.bodySchema = this.bodySchema
        if (this.outputSchema) r.outputSchema = this.outputSchema
        if (this.callback) r.callback = this.callback
        return r
    }

    /**
     * Attaches a Zod schema used to validate (and narrow) the request body.
     * When validation fails, `dispatch` returns a `400` response automatically.
     *
     * @param bodySchema - Zod schema for the request body.
     */
    input<U>(bodySchema: ZodType<U>): Method<U, TOutput> {
        const r = new Method<U, TOutput>()
        r.middlewares = this.middlewares
        r.bodySchema = bodySchema
        if (this.outputSchema) r.outputSchema = this.outputSchema as ZodType<TOutput>
        if (this.callback)
            r.callback = this.callback as unknown as EndpointCallback<U, TOutput>
        return r
    }

    /**
     * Attaches a Zod schema that describes the expected response shape.
     * Currently stored for documentation / code-generation purposes.
     *
     * @param schema - Zod schema for the response body.
     */
    output<U>(schema: ZodType<U>): Method<TInput, U> {
        const r = new Method<TInput, U>()
        r.middlewares = this.middlewares
        if (this.bodySchema) r.bodySchema = this.bodySchema
        r.outputSchema = schema
        if (this.callback)
            r.callback = this.callback as unknown as EndpointCallback<TInput, U>
        return r
    }

    /**
     * Registers the async handler callback for this method.
     *
     * @param callback - Function that receives the validated body, the raw
     *   Lambda event, and the Lambda context, and returns the response.
     */
    handle(callback: EndpointCallback<TInput, TOutput>): Method<TInput, TOutput> {
        const r = new Method<TInput, TOutput>()
        r.middlewares = this.middlewares
        if (this.bodySchema) r.bodySchema = this.bodySchema
        if (this.outputSchema) r.outputSchema = this.outputSchema
        r.callback = callback
        return r
    }
}

/** Creates a new, empty {@link Method} builder. */
export function method(): Method {
    return new Method()
}
