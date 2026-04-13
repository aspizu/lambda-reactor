import {Router} from "#src/router"
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs"
import {RetentionDays} from "aws-cdk-lib/aws-logs"

import cors from "./cors"

export default () =>
    new Router({
        cors,
        functionFactory: (scope, path, entry) => {
            return new NodejsFunction(scope, path, {
                entry,
                handler: "handler",
                logRetention: RetentionDays.ONE_WEEK,
            })
        },
        methodFactory: (resource, _path, method, integration) => {
            return resource.addMethod(method, integration)
        },
    })
