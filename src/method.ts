import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import type {ZodType} from "zod"

import {type Middleware} from "./middleware"

/**
 * The user-supplied handler function for a single HTTP method on a route.
 *
 * @typeParam TInput - Shape of the validated request body (after Zod parsing).
 */
export type EndpointCallback<TInput = unknown> = (props: {
    body: TInput
    context: Context
    event: APIGatewayProxyEvent
}) => Promise<unknown> | unknown

export class Method<TInput = unknown, TOutput = unknown> {
    bodySchema?: ZodType<TInput>
    callback?: EndpointCallback<TInput>
    middlewares: Middleware[] = []
    outputSchema?: ZodType<TOutput>

    /**
     * Registers the async handler callback for this method.
     *
     * @param callback - Function that receives the validated body, the raw
     *   Lambda event, and the Lambda context, and returns the response.
     */
    handle(callback: EndpointCallback<TInput>): Method<TInput, TOutput> {
        const r = new Method<TInput, TOutput>()
        r.middlewares = this.middlewares
        if (this.bodySchema) r.bodySchema = this.bodySchema
        if (this.outputSchema) r.outputSchema = this.outputSchema
        r.callback = callback
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
        if (this.callback) r.callback = this.callback as unknown as EndpointCallback<U>
        return r
    }

    /**
     * Attaches a Zod schema used to validate the response body at runtime.
     * When the callback result does not satisfy the schema, {@link dispatch}
     * logs the error and returns a `500` response automatically.
     *
     * @param schema - Zod schema for the response body.
     */
    output<U>(schema: ZodType<U>): Method<TInput, U> {
        const r = new Method<TInput, U>()
        r.middlewares = this.middlewares
        if (this.bodySchema) r.bodySchema = this.bodySchema
        r.outputSchema = schema
        if (this.callback)
            r.callback = this.callback as unknown as EndpointCallback<TInput>
        return r
    }

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
}
