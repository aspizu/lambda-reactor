import type {StackProps} from "aws-cdk-lib"
import {Stack} from "aws-cdk-lib"
import {RestApi} from "aws-cdk-lib/aws-apigateway"
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs"
import {RetentionDays} from "aws-cdk-lib/aws-logs"

import router from "./utils/router"

function functionFactory(scope: Stack) {
    return (entry: string, id: string) =>
        new NodejsFunction(scope, id, {
            entry,
            handler: "handler",
            logRetention: RetentionDays.ONE_WEEK,
        })
}

export class UsersStack extends Stack {
    constructor(scope: Stack, id: string, props?: StackProps) {
        super(scope, id, props)
        const api = new RestApi(this, "UsersRestApi")
        router()
            .route("/user")
            .route("/user/{user_id}")
            .defineRestApi(api, functionFactory(scope))
    }
}
