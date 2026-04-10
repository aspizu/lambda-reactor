import {Response} from "#src/response"
import type {APIGatewayProxyEvent, Context} from "aws-lambda"
import type {ZodType} from "zod"

export type EndpointCallback<TInput, TOutput> = (props: {
    body: TInput
    event: APIGatewayProxyEvent
    context: Context
}) => Promise<TOutput | Response> | TOutput | Response

export interface RouteHandler {
    readonly bodySchema?: ZodType<unknown>
    readonly outputSchema?: ZodType<unknown>
    readonly callback?: (props: never) => unknown
}

export class Method<TInput = unknown, TOutput = unknown> {
    bodySchema?: ZodType<TInput>
    outputSchema?: ZodType<TOutput>
    callback?: EndpointCallback<TInput, TOutput>

    input<U>(bodySchema: ZodType<U>): Method<U, TOutput> {
        const r = new Method<U, TOutput>()
        r.bodySchema = bodySchema
        if (this.outputSchema) r.outputSchema = this.outputSchema as ZodType<TOutput>
        if (this.callback)
            r.callback = this.callback as unknown as EndpointCallback<U, TOutput>
        return r
    }

    output<U>(schema: ZodType<U>): Method<TInput, U> {
        const r = new Method<TInput, U>()
        if (this.bodySchema) r.bodySchema = this.bodySchema
        r.outputSchema = schema
        if (this.callback)
            r.callback = this.callback as unknown as EndpointCallback<TInput, U>
        return r
    }

    handle(callback: EndpointCallback<TInput, TOutput>): Method<TInput, TOutput> {
        const r = new Method<TInput, TOutput>()
        if (this.bodySchema) r.bodySchema = this.bodySchema
        if (this.outputSchema) r.outputSchema = this.outputSchema
        r.callback = callback
        return r
    }
}

export function method() {
    return new Method()
}
