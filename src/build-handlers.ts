import {join} from "path"

import type {IFunction} from "aws-cdk-lib/aws-lambda"
/**
 * A factory function that constructs an AWS Lambda {@link IFunction} from a
 * source-file entry path and a logical identifier string.
 */
export type FunctionFactory = (entry: string, id: string) => IFunction

/**
 * Builds a map of route paths to Lambda functions by invoking `factory` for
 * each path.
 *
 * The `entry` passed to `factory` is the absolute path
 * `<cwd>/src/<path>.ts`, and the `id` is the route path string itself.
 *
 * @param paths   - Array of route path strings (e.g. `["/users", "/items"]`).
 * @param factory - {@link FunctionFactory} used to construct each Lambda function.
 */
export function buildHandlers<TPaths extends string>(
    paths: TPaths[],
    factory: FunctionFactory,
): Record<TPaths, IFunction> {
    return Object.fromEntries(
        paths.map((path) => [
            path,
            factory(join(process.cwd(), "src", `${path}.ts`), path),
        ]),
    ) as Record<TPaths, IFunction>
}
