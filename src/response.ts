import type {APIGatewayProxyResult} from "aws-lambda"

export class Response {
    status?: number
    body?: unknown
    text?: string
    headers?: Record<string, string>

    private constructor() {}

    static text(status: number, text: string) {
        const r = new Response()
        r.status = status
        r.text = text
        return r
    }

    static json(status: number, body: unknown) {
        const r = new Response()
        r.status = status
        r.body = body
        return r
    }

    header(name: string, value: string): Response {
        const r = new Response()
        if (this.status !== undefined) r.status = this.status
        if (this.body !== undefined) r.body = this.body
        if (this.text !== undefined) r.text = this.text
        r.headers = {...this.headers, [name]: value}
        return r
    }

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
