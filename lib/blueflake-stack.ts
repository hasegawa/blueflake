import * as cdk from 'aws-cdk-lib';
import { AllowedMethods, CachePolicy, Distribution, OriginProtocolPolicy, OriginRequestPolicy, OriginSslPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class BlueflakeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB設定
    const sequenceTable = new Table(this, "sequenceTable", {
      partitionKey: {
        name: "timeStampAndRandomKey",
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Lamdbda設定
    const commonProps: Partial<NodejsFunctionProps> = {
      runtime: Runtime.NODEJS_18_X,
    }
    // ID生成API
    const sequence = new NodejsFunction(this, "v1-sequence", {
      ...commonProps,
      entry: "lib/lambda/api/v1-sequence.ts",
      functionName: "v1-sequence",
      environment: {
        SEQUENCE_TABLE_NAME: sequenceTable.tableName,
      }
    })
    sequenceTable.grantFullAccess(sequence)
    const sequenceFunctionUrl = sequence.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })
    // エラーレスポンスAPI
    const notFound = new NodejsFunction(this, "not-found-error", {
      ...commonProps,
      entry: "lib/lambda/api/not-found-error.ts",
      functionName: "not-found-error",
    })
    const notFoundFunctionUrl = notFound.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })

    // CloudFront
    new Distribution(this, "sequence-distribution", {
      // デフォルトBehaviorにエラーレスポンス
      defaultBehavior: {
        origin: new HttpOrigin(cdk.Fn.select(2, cdk.Fn.split("/", notFoundFunctionUrl.url)), {
        })
      },
      additionalBehaviors: {
        "/v1/sequence": {
          origin: new HttpOrigin(cdk.Fn.select(2, cdk.Fn.split("/", sequenceFunctionUrl.url)), {
            protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
            originSslProtocols: [OriginSslPolicy.TLS_V1_2],
            customHeaders: {
              "x-from-cloudfront": "cloudfront-ok",
            },
          }),
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
          originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          cachePolicy: CachePolicy.CACHING_DISABLED,
        }
      }
    })

  }
}
