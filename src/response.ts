import type {APIGatewayProxyResult} from "aws-lambda"

/**
 * Immutable builder for AWS Lambda proxy responses.
 *
 * All mutation methods return a new `Response` instance so that existing
 * instances are never modified.  Construct instances through the static
 * factory methods {@link Response.text} and {@link Response.json}.
 */
export class Response {
    status?: number
    body?: unknown
    text?: string
    headers?: Record<string, string>

    private constructor() {}

    /**
     * Creates a plain-text response.
     *
     * @param status - HTTP status code.
     * @param text - Response body as a plain string.
     */
    static text(status: number, text: string) {
        const r = new Response()
        r.status = status
        r.text = text
        return r
    }

    /**
     * Creates a JSON response.
     *
     * @param status - HTTP status code.
     * @param body - Value to be serialised with `JSON.stringify`.
     */
    static json(status: number, body: unknown) {
        const r = new Response()
        r.status = status
        r.body = body
        return r
    }

    /**
     * Returns a new `Response` with an additional HTTP response header.
     *
     * @param name - Header name (e.g. `"Allow"`).
     * @param value - Header value.
     */
    header(name: string, value: string): Response {
        const r = new Response()
        if (this.status !== undefined) r.status = this.status
        if (this.body !== undefined) r.body = this.body
        if (this.text !== undefined) r.text = this.text
        r.headers = {...this.headers, [name]: value}
        return r
    }

    /**
     * Serialises this `Response` into the shape expected by the AWS Lambda
     * proxy integration.
     *
     * - When constructed via {@link Response.json} the body is JSON-encoded
     *   and `Content-Type` is set to `application/json; charset=utf-8`.
     * - When constructed via {@link Response.text} the body is returned as-is
     *   and `Content-Type` is set to `text/plain; charset=utf-8`.
     * - Additional headers set via {@link Response.header} are merged last and
     *   therefore take precedence over the defaults above.
     */
    toAPIGatewayProxyResult(): APIGatewayProxyResult {
        return {
            statusCode: this.status ?? 200,
            body:
                this.text === undefined ?
                    (JSON.stringify(this.body) ?? "null")
                :   this.text,
            headers: {
                "Content-Type":
                    this.text === undefined ?
                        "application/json; charset=utf-8"
                    :   "text/plain; charset=utf-8",
                ...this.headers,
            },
        }
    }
}
