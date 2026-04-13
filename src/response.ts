import type {APIGatewayProxyResult} from "aws-lambda"

/**
 * Immutable builder for AWS Lambda proxy responses.
 *
 * All mutation methods return a new `Response` instance so that existing
 * instances are never modified.  Construct instances through the static
 * factory methods {@link Response.text} and {@link Response.json}.
 */
export class Response {
    private _body?: unknown
    private _headers?: Record<string, string>
    private _status?: number
    private _text?: string

    private constructor() {}

    /**
     * Creates a JSON response.
     *
     * @param status - HTTP status code.
     * @param body - Value to be serialised with `JSON.stringify`.
     */
    static json(status: number, body: unknown) {
        const r = new Response()
        r._status = status
        r._body = body
        return r
    }

    /**
     * Creates a plain-text response.
     *
     * @param status - HTTP status code.
     * @param text - Response body as a plain string.
     */
    static text(status: number, text: string) {
        const r = new Response()
        r._status = status
        r._text = text
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
        if (this._status !== undefined) r._status = this._status
        if (this._body !== undefined) r._body = this._body
        if (this._text !== undefined) r._text = this._text
        r._headers = {...this._headers, [name]: value}
        return r
    }

    _toAPIGatewayProxyResult(): APIGatewayProxyResult {
        return {
            body:
                this._text === undefined ?
                    (JSON.stringify(this._body) ?? "null")
                :   this._text,
            headers: {
                "Content-Type":
                    this._text === undefined ?
                        "application/json; charset=utf-8"
                    :   "text/plain; charset=utf-8",
                ...this._headers,
            },
            statusCode: this._status ?? 200,
        }
    }
}
