import {router} from "#src/api"
import {RestApi} from "aws-cdk-lib/aws-apigateway"
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs"
import {Stack, type StackProps} from "aws-cdk-lib/core"
import {type Construct} from "constructs"

export class AppStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)
        const api = new RestApi(this, "Api")
        router()
            .route("/health")
            .route("/items")
            .route("/users/{id}")
            .defineRestApi(
                api,
                (entry, handlerId) => new NodejsFunction(this, handlerId, {entry}),
            )
    }
}
