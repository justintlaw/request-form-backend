// The below two are not yet fully implemented in v2, so using alpha versions instead
import * as apigwAlphaIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as apigwAlpha from '@aws-cdk/aws-apigatewayv2-alpha'

import { 
  aws_dynamodb,
  aws_iam,
  aws_ecs,
  aws_ecs_patterns,
  aws_lambda,
  aws_lambda_event_sources,
  aws_sns,
  aws_sns_subscriptions,
  Stack,
  StackProps
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'

export class RequestFormBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // TODOS
    // - add a vpc
    // - use ecr
    // - add an sns topic

    const maintenanceRequestsTable = new aws_dynamodb.Table(this, 'RequestsTable', {
      tableName: 'maintenance_requests',
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING }
      // stream: aws_dynamodb.StreamViewType.NEW_IMAGE
    })

    // const handleTableChangeLambda = new aws_lambda.Function(this, 'HandleTableChange', {
    //   code: aws_lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'handle-table-change')), // TODO: add lambda
    //   handler: 'index.handler',
    //   functionName: 'RequestFormTableStreamHandler',
    //   runtime: aws_lambda.Runtime.NODEJS_14_X
    // })

    // handleTableChangeLambda.addEventSource(new aws_lambda_event_sources.DynamoEventSource(maintenanceRequestsTable, {
    //   startingPosition: aws_lambda.StartingPosition.LATEST
    // }))

    const ecsTaskRole = new aws_iam.Role(this, 'BackendTaskRole', {
      assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    })

    maintenanceRequestsTable.grantReadWriteData(ecsTaskRole)

    const cluster = new aws_ecs.Cluster(this, 'ApiCluster')

    const service = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, 'RestApiFargate', {
      cluster,
      memoryLimitMiB: 1024,
      desiredCount: 1,
      cpu: 512,
      taskImageOptions: {
        // TODO: use ecr here
        image: aws_ecs.ContainerImage.fromAsset(path.join(__dirname, '..', 'src', 'api')),
        containerPort: 3000,
        environment: {
          TABLE_NAME: maintenanceRequestsTable.tableName
        },
        taskRole: ecsTaskRole
      }
    })

    const defaultIntegration = new apigwAlphaIntegrations.HttpAlbIntegration('DefaultIntegration', service.listener)

    const httpEndpoint = new apigwAlpha.HttpApi(this, 'HttpApi', {
      defaultIntegration
    })

    httpEndpoint.addRoutes({
      path: '/api/{any+}',
      methods: [apigwAlpha.HttpMethod.ANY],
      integration: defaultIntegration
    })
  }
}
